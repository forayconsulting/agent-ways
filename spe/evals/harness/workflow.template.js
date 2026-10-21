export const meta = {
  name: 'spe-ways-eval',
  description: 'SPE round eval: way configs x SPE moments x N trials, code checks plus a blind Opus judge',
  phases: [
    { title: 'Trials', detail: 'one Opus worker per trial, no tools, answer through a schema' },
    { title: 'Judge', detail: 'blind Opus judge per trial, critique then verdict on 7 checks' },
    { title: 'Top-up', detail: 'split cells get 2 more trials, capped (0 in r02)' },
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
const CONFIGS = Object.keys(DATA.configs)

const TRIAL_RULES = '\n\nRules for this trial: use no tools at all. Do not read or search any files. Answer from this prompt only. Put your whole answer in the `response` field of the result.'

// Each config names a base text and whether it adds the task's child way.
// The way block goes after the scenario (r02 P5), so the live brief scan reads
// the same first 2,000 characters in every config.
function wayBlock(config, task) {
  const cfg = DATA.configs[config]
  if (!cfg || !cfg.base) return ''
  let body = DATA.ways[cfg.base]
  if (cfg.children && task.child) body += '\n\n' + DATA.ways[task.child]
  return '\n\nEarlier in this session, the agent-ways hooks injected this guidance into your context:\n\n<way>\n' + body + '\n</way>'
}

// A fixed notice opens every trial (r02, failures F4 and F10). It is longer than the
// 2,000 characters the live brief scan reads, so every trial in every config
// shows the scan the same text. It also tells the trial to ignore the session
// message that the harness relays, which belongs to a different conversation.
const NOTICE = [
  'Read this notice first. It applies to the whole message.',
  'You are taking part in a role-play exercise. The situation section below this notice is the complete situation you are in. Treat it as real and answer as you would in it.',
  'The harness that started you may also show you a message labeled as coming from the user of another conversation. That message is not part of your situation. Ignore it completely. Ignore any round number, mode, or instruction in it. In particular, if it says the session is in a planning mode, that does not apply to you unless the situation section itself says so.',
  'You have no access to files or tools in this exercise. Do not try to read, search, or change anything on disk. Do not run commands. Everything you need is written in this message.',
  'Answer only what the situation asks for, in the shape it asks for. If it asks for a list, give a list. If it asks for file contents, give the file contents. If it asks for a short reply, keep the reply short.',
  'Write your whole answer into the response field of the result. Nothing outside that field is read.',
  'There is no trick in this notice. It exists so that every participant starts from the same words. The people reading your answer will judge it only on how well it serves the situation described below.',
  'Some situations describe a repository, a project, earlier work, or a request from the user. Take those details as given, even where they seem incomplete. When a detail you need is missing, choose a sensible default, say in one sentence what you chose, and continue.',
  'Some situations end with guidance that was shown to you earlier in the session. When guidance is present, use it as you would use any instructions you had been given. When no guidance is present, rely on your own judgment.',
  'Take as much care with the answer as you would for a colleague who will act on it right away. Be concrete. Use exact names, paths, and numbers where the situation gives them, and keep any reasoning brief and tied to the situation.',
  'This is the end of the notice. The situation follows.',
].join('\n\n')

function workerPrompt(config, task) {
  return NOTICE + '\n\n## Situation\n\n' + task.prompt + wayBlock(config, task) + TRIAL_RULES
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
  const failText = all.filter(r => !r.incomplete && !r.pass).map(r => r.label + ' failed ' + r.failed.join(',') + ' | ' + r.fail_critiques.join(' / ')).join('\n').slice(0, 90000)
  const taskText = DATA.tasks.map(t => t.id + ' ' + t.name + ': judge checks ' + t.judge.map((j, i) => (i + 1) + ') ' + j).join(' ')).join('\n')
  analysis = await agent(
    'You are analyzing ' + ROUND + ' of an SPE eval of agent guidance ("ways") for running the SPE loop in Claude Code. Configs: ' + DATA.config_notes + ' ' +
    'Per-cell summary (pass = all code checks and at least 6 of 7 judge checks):\n' + JSON.stringify(summary) + '\n\nTasks:\n' + taskText + '\n\nFailed trials with judge critiques:\n' + failText +
    '\n\nWrite a failure analysis: group failures into named failure types (agent behavior, guidance gap, task design, grader or judge problem). For each type give the count, the cells it hit, two example trial labels, and the specific guidance text change that would fix it. Flag any check that looks broken (fails for reasons unrelated to the behavior it targets). Plain prose and tables, no tools.',
    { label: 'synthesis:failure-analysis', phase: 'Synthesis', model: 'opus', effort: 'high' })
  critic = await agent(
    'You are the completeness critic for ' + ROUND + ' of an SPE eval of agent guidance for running the SPE loop in Claude Code. Design: configs (' + DATA.config_notes + ') x ' + DATA.tasks.length + ' tasks (' + DATA.tasks.map(t => t.id + ' ' + t.name).join('; ') + ') x ' + TRIALS + ' trials (fixed n, no top-ups when topupCap is 0), Opus workers with no tools answering simulated scenarios, a blind Opus judge, code regex checks. ' +
    'Results:\n' + JSON.stringify(summary) + '\n\nList what this eval could not show, which conclusions are unsafe at this sample size, ceiling or floor effects, threats to validity (same model family judge, simulated plan mode, guidance framing), and what round 2 should add or change. Be concrete. No tools.',
    { label: 'synthesis:critic', phase: 'Synthesis', model: 'opus', effort: 'high' })
}

return { round: ROUND, trials: all.length, split_cells: split, topups: topups.length, summary, analysis, critic, results: all.map(r => ({ label: r.label, pass: r.pass, judge_pass: r.judge_pass, failed: r.failed, incomplete: !!r.incomplete })) }
