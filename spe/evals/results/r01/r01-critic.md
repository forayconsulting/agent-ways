## Bottom line

The guidance clearly beats no guidance (config A) in this eval. But much of that gap comes from house format and vocabulary that config A was never shown. B and C hit the ceiling on T1 to T5, so the eval cannot rank B against C there. The only B vs C difference likely to hold up is on T7. The T4 and T6 results depend on one code check (`fentry`) that may be too brittle.

## What this eval could not show

1. **Real behavior.** Workers had no tools. They described what they would do. No run checked that a prediction file exists on disk before the run, that the plan copy was saved, or that the Workflow script runs. T3 checks for the words "dry run" and "critic". It does not check that a working script was produced.
2. **Real disclosure.** B and C were most likely injected in full. In real sessions, ways disclose through hook triggers. The eval does not show whether the right leaf of the tree loads at the right moment.
3. **Phase recognition.** Each scenario names its phase, for example "Plan just approved" or "Grader bug found". In real sessions the model has to notice the phase by itself. The eval gives that step away.
4. **Over-application.** No task was outside the SPE loop. The eval cannot show whether the guidance makes the model run SPE ceremony on trivial work.
5. **Multi-turn and long-horizon effects.** Every task was a single turn. There was no compaction, no user pushback, and no drift across rounds.
6. **Other models.** Only Opus workers were tested. Sonnet results are unknown.
7. **Cost.** Output length and token use were not reported. The guidance may make answers longer, and a judge may reward length.

## Conclusions that are unsafe at this sample size

1. **"C is better than B overall."** T7 is the only strong signal. B passed 1 of 7 and C passed 5 of 5, which gives a one-sided Fisher p of about 0.008. The T4 gap (4/7 vs 5/5) is within noise. The T6 gap (0/5 vs 4/7) comes almost entirely from the `fentry` regex. B's judge mean on T6 is 6.8 even though B passed 0 of 5.
2. **"B and C are equal on T1 to T5."** Both scored 7.0 on the judge, so this is a ceiling. It is not evidence that they are equal.
3. **"The guidance improves SPE method by a large margin."** Config A fails code checks like `spec_table`, `pred_file`, `plan_copy`, `source_col`, `defaults`, `log_cols`, and `tag`. Those checks test the house vocabulary. A-T2 scored a judge mean of 6.0 and A-T6 scored 6.29, so the baseline reasons well on those tasks. Its losses there are mostly about format.
4. **"T6 is solved."** No config passes T6 reliably. C is the best at 4 of 7.
5. **Per-criterion failure rates.** Each cell has 5 to 7 trials. A single flip moves a rate by 14 to 20 points.
6. **Any result from the cells with n=7.** A-T6, B-T1, B-T4, B-T7, C-T3, and C-T6 ran 7 trials and the rest ran 5. If the extra trials were reruns triggered by bad or odd results, those cells carry selection bias. Round 1 does not say why they got extra trials.

## Ceiling and floor effects

1. **Ceiling.** B and C both scored a judge mean of 7.0 on T1, T2, T4 (C), and T5. The judge has no headroom to separate them on those tasks.
2. **Floor.** Config A scored 0 passes on 6 of 7 tasks. Many of its code checks fail 5 of 5 because A has never seen the artifact names. A floor that comes from vocabulary says little about method.
3. **Pass rule versus criteria.** C-T7 passes 5 of 5 while it fails judge criterion 7 in 4 of 5 trials. So the pass rule is a threshold, not "all criteria met." Criterion 7 on T7 fails in both B (6 of 7) and C (4 of 5). Either neither guidance covers it, or the criterion is wrong. Round 1 cannot tell which.
4. **Code and judge disagree.** The `fentry` check fails across all configs on T6 (A 6/7, B 5/5, C 2/7) and on T4 (A 4/5, B 3/7). Judge scores on those same trials are high. This pattern points to a brittle regex more than to a real gap in behavior.

## Threats to validity

1. **Same-family judge.** Opus judged Opus. The judge may share the workers' blind spots and stylistic preferences. No human or cross-family check measured how well the judge agrees with an outside grader.
2. **Blinding leaks through vocabulary.** The judge was blind to config. But B and C outputs use house terms, and the rubric likely uses the same terms. So the judge can infer which outputs were guided.
3. **Circular authorship.** The same author probably wrote the guidance, the tasks, the rubric, and the regexes. Tasks may fit the guidance wording closely. Paraphrased scenarios could break that fit.
4. **Simulated plan mode.** T1 and T7 describe plan mode in text. The worker never actually calls ExitPlanMode and is never blocked from writing files. The behavior that plan mode constrains was not exercised.
5. **Guidance framing and length.** B (the tree) is longer than C (the slim file). B's weak T7 score could come from dilution, from a missing rule, or from two leaves that conflict. Round 1 did not separate these causes. Where the guidance sat in the prompt and how it was framed (system prompt or user content) also differ from real hook injection.
6. **Correlated trials.** All trials in a cell used the same prompt. Five samples of one prompt measure sampling noise. They do not measure robustness across scenarios.
7. **Single scenario per task.** Each task has one phrasing. A result on T3 is a result on one T3 prompt.

## What round 2 should add or change

1. **Audit the `fentry` regex** against the T4 and T6 transcripts before anything else. Publish a table of code verdicts against judge verdicts for every check, and fix or loosen checks that disagree with the judge.
2. **Read judge criterion 7 on T7.** Decide whether it is a guidance gap or a rubric bug. Then compare the tree's T7 leaf with the slim file's wording to find why B fails criteria 5, 6, and 7.
3. **Add config D.** D is a plain description of the SPE method with no house artifact names. Comparing A, D, and C separates method gains from format gains.
4. **Add config B-hooks.** B-hooks delivers the tree through real trigger-based disclosure. It tests whether the right leaf loads.
5. **Use equal n of at least 10 per cell.** Report Wilson intervals. Preregister the B vs C comparisons on T4, T6, and T7. Log why any trial was rerun.
6. **Raise the ceiling.** Use scenarios that do not name their phase. Add user pressure to skip predictions or the dry run, conflicting instructions, long noisy context, and multi-turn rounds that span a compaction.
7. **Add control tasks** that sit outside the SPE loop. Score whether each config wrongly applies SPE steps.
8. **Run tasks for real** in a sandbox with tools for T1, T3, T4, and T7. Check the disk for the prediction file, the plan copy, the log columns, and a script that runs its dry run.
9. **Check the judge.** Have a human grade about 20 samples, or add a non-Opus judge. Report agreement. Strip house vocabulary from outputs before judging, or test whether the judge can guess the config.
10. **Write 2 to 3 paraphrased variants per task** to test whether the guidance overfits the task wording.
11. **Record output tokens** per trial. Check whether judge scores track length.
12. **Add Sonnet workers** for at least C and A, since the guidance should work on more than one model.
