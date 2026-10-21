export const meta = {
  name: 'spe-ways-eval',
  description: 'SPE round eval: way configs A/B/C x 7 SPE moments x N trials, code checks plus a blind Opus judge',
  phases: [
    { title: 'Trials', detail: 'one Opus worker per trial, no tools, answer through a schema' },
    { title: 'Judge', detail: 'blind Opus judge per trial, critique then verdict on 7 checks' },
    { title: 'Top-up', detail: 'split cells get 2 more trials, capped' },
    { title: 'Synthesis', detail: 'failure analysis and completeness critic' },
  ],
}

// Generated data: tasks, way texts. Built by build_workflow.py. Do not hand-edit the built file.
const DATA = __DATA__

const ROUND = (args && args.round) || DATA.round
const TRIALS = (args && args.trials) || 5
const TOPUP_PER_CELL = 2
const TOPUP_CAP = (args && args.topupCap != null) ? args.topupCap : 24
const ONLY = (args && args.only) || null // e.g. ["B-T1", "A-T7"]: dry run on these cells, 1 trial each
const CONFIGS = ['A', 'B', 'C']

const TRIAL_RULES = '\n\nRules for this trial: use no tools at all. Do not read or search any files. Answer from this prompt only. Put your whole answer in the `response` field of the result.'

function wayBlock(config, task) {
  if (config === 'A') return ''
  let body
  if (config === 'B') {
    body = DATA.ways.root
    if (task.child) body += '\n\n' + DATA.ways[task.child]
  } else {
    body = DATA.ways.slim
  }
  return 'The agent-ways hooks injected this guidance into your context earlier in the session:\n\n<way>\n' + body + '\n</way>\n\n'
}

function workerPrompt(config, task) {
  return wayBlock(config, task) + task.prompt + TRIAL_RULES
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: { response: { type: 'string', description: 'Your complete answer' } },
  required: ['response'],
}

const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { n: { type: 'integer' }, critique: { type: 'string' }, pass: { type: 'boolean' } },
        required: ['n', 'critique', 'pass'],
      },
    },
  },
  required: ['checks'],
}

function codeChecks(task, text) {
  const out = {}
  for (const c of task.code) {
    if (c.order) {
      const a = text.search(new RegExp(c.order[0], 'i'))
      const b = text.search(new RegExp(c.order[1], 'i'))
      out[c.id] = a >= 0 && (b < 0 || a < b)
      continue
    }
    const re = new RegExp(c.regex, 'gi')
    const n = (text.match(re) || []).length
    const ok = n >= (c.min_count || 1)
    out[c.id] = c.must_not ? n === 0 : ok
  }
  return out
}

function judgePrompt(task, text) {
  const checks = task.judge.map((j, i) => (i + 1) + '. ' + j).join('\n')
  return 'You are grading one answer from a Claude Code agent in an evaluation. Be strict. A check passes only when the answer clearly does what it says. Missing or vague counts as fail.\n\n' +
    '## The situation the agent was given\n\n' + task.prompt + '\n\n' +
    '## The agent\'s answer\n\n<answer>\n' + text + '\n</answer>\n\n' +
    '## Checks\n\n' + checks + '\n\n' +
    'For each check, write a one to three sentence critique that quotes or points to the answer, then give pass true or false. Return all ' + task.judge.length + ' checks in order. Do not use any tools.'
}

async function runTrial(config, task, n, phaseTitle) {
  const label = ROUND + '-' + config + '-' + task.id + '-' + n
  const res = await agent(workerPrompt(config, task), { label: 'trial:' + label, phase: phaseTitle, schema: RESULT_SCHEMA, model: 'opus', effort: 'high' })
  if (!res || typeof res.response !== 'string') return { label, config, task: task.id, n, incomplete: true }
  const text = res.response
  const code = codeChecks(task, text)
  const j = await agent(judgePrompt(task, text), { label: 'judge:' + label, phase: 'Judge', schema: JUDGE_SCHEMA, model: 'opus', effort: 'medium' })
  if (!j || !Array.isArray(j.checks)) return { label, config, task: task.id, n, code, chars: text.length, incomplete: true }
  const judge = j.checks.map(c => !!c.pass)
  const judgePass = judge.filter(Boolean).length
  const codeOk = Object.values(code).every(Boolean)
  return {
    label, config, task: task.id, n, chars: text.length, code, judge, judge_pass: judgePass,
    pass: codeOk && judgePass >= 6,
    failed: [...Object.entries(code).filter(([, v]) => !v).map(([k]) => 'code:' + k), ...judge.map((p, i) => p ? null : 'judge:' + (i + 1)).filter(Boolean)],
    fail_critiques: j.checks.filter(c => !c.pass).map(c => '#' + c.n + ' ' + c.critique).slice(0, 4),
  }
}

// ---- Trials
phase('Trials')
let cells = []
for (const c of CONFIGS) for (const t of DATA.tasks) cells.push({ config: c, task: t })
if (ONLY) cells = cells.filter(x => ONLY.includes(x.config + '-' + x.task.id))
const perCell = ONLY ? 1 : TRIALS
const items = []
for (const cell of cells) for (let n = 1; n <= perCell; n++) items.push({ ...cell, n })
log(ROUND + ': ' + items.length + ' trials over ' + cells.length + ' cells' + (ONLY ? ' (dry run)' : ''))

const trials = (await pipeline(items, it => runTrial(it.config, it.task, it.n, 'Trials'))).filter(Boolean)

// ---- Top-up (barrier: needs every trial of a cell)
phase('Top-up')
const byCell = {}
for (const r of trials) {
  if (r.incomplete) continue
  const k = r.config + '-' + r.task
  ;(byCell[k] = byCell[k] || []).push(r)
}
const split = Object.entries(byCell).filter(([, rs]) => rs.some(r => r.pass) && rs.some(r => !r.pass)).map(([k]) => k)
const topItems = []
if (!ONLY) {
  for (const k of split) {
    const [config, tid] = k.split('-')
    const task = DATA.tasks.find(t => t.id === tid)
    for (let i = 1; i <= TOPUP_PER_CELL; i++) {
      if (topItems.length >= TOPUP_CAP) break
      topItems.push({ config, task, n: perCell + i })
    }
  }
  const dropped = split.length * TOPUP_PER_CELL - topItems.length
  log('split cells: ' + split.length + ', top-up trials: ' + topItems.length + (dropped > 0 ? ', dropped by cap: ' + dropped : ''))
}
const topups = (await pipeline(topItems, it => runTrial(it.config, it.task, it.n, 'Top-up'))).filter(Boolean)
const all = [...trials, ...topups]

// ---- Summary
const summary = {}
for (const r of all) {
  const k = r.config + '-' + r.task
  const s = (summary[k] = summary[k] || { done: 0, pass: 0, incomplete: 0, judge_mean: 0, fails: {} })
  if (r.incomplete) { s.incomplete++; continue }
  s.done++
  if (r.pass) s.pass++
  s.judge_mean += r.judge_pass
  for (const f of r.failed) s.fails[f] = (s.fails[f] || 0) + 1
}
for (const s of Object.values(summary)) s.judge_mean = s.done ? +(s.judge_mean / s.done).toFixed(2) : null

// ---- Synthesis
phase('Synthesis')
let analysis = null, critic = null
if (!ONLY) {
  const failText = all.filter(r => !r.incomplete && !r.pass).map(r => r.label + ' failed ' + r.failed.join(',') + ' | ' + r.fail_critiques.join(' / ')).join('\n').slice(0, 60000)
  const taskText = DATA.tasks.map(t => t.id + ' ' + t.name + ': judge checks ' + t.judge.map((j, i) => (i + 1) + ') ' + j).join(' ')).join('\n')
  analysis = await agent(
    'You are analyzing ' + ROUND + ' of an SPE eval of agent guidance ("ways") for running the SPE loop in Claude Code. Configs: A = no SPE guidance, B = a tree of ways (root plus one child per moment), C = one slim file. ' +
    'Per-cell summary (pass = all code checks and at least 6 of 7 judge checks):\n' + JSON.stringify(summary) + '\n\nTasks:\n' + taskText + '\n\nFailed trials with judge critiques:\n' + failText +
    '\n\nWrite a failure analysis: group failures into named failure types (agent behavior, guidance gap, task design, grader or judge problem). For each type give the count, the cells it hit, two example trial labels, and the specific guidance text change that would fix it. Flag any check that looks broken (fails for reasons unrelated to the behavior it targets). Plain prose and tables, no tools.',
    { label: 'synthesis:failure-analysis', phase: 'Synthesis', model: 'opus', effort: 'high' })
  critic = await agent(
    'You are the completeness critic for ' + ROUND + ' of an SPE eval of agent guidance for running the SPE loop in Claude Code. Design: 3 configs (A none, B tree, C slim file) x 7 tasks (' + DATA.tasks.map(t => t.id + ' ' + t.name).join('; ') + ') x ' + TRIALS + ' trials, Opus workers with no tools answering simulated scenarios, a blind Opus judge, code regex checks. ' +
    'Results:\n' + JSON.stringify(summary) + '\n\nList what this eval could not show, which conclusions are unsafe at this sample size, ceiling or floor effects, threats to validity (same model family judge, simulated plan mode, guidance framing), and what round 2 should add or change. Be concrete. No tools.',
    { label: 'synthesis:critic', phase: 'Synthesis', model: 'opus', effort: 'high' })
}

return { round: ROUND, trials: all.length, split_cells: split, topups: topups.length, summary, analysis, critic, results: all.map(r => ({ label: r.label, pass: r.pass, judge_pass: r.judge_pass, failed: r.failed, incomplete: !!r.incomplete })) }
