**Bottom line**
- Three results hold up at n=8:
  - Any SPE guidance beats no guidance (A) on loop tasks.
  - The bands rule fixes the band check.
  - Every guided config adds ceremony to an unrelated request (H3).
- Most other comparisons are noise at this sample size. That includes C2 vs D.

**Conclusions that are safe at n=8**
1. Guidance beats A on loop tasks. Total passes are A 14/96, C 48/96, C2 68/96 and D 74/96.
2. The bands rule works on the band check. C-T1 goes from 0/8 to 8/8 in C2-T1. C-H1 goes from 2/8 to 8/8 in C2-H1. Caveat: the rule adds the exact word that the regex looks for, so this result is close to circular.
3. Guidance causes over-ceremony on H3. A passes 8/8. C passes 1/8, and C2 and D pass 0/8. Fisher p is below 0.001. This is the strongest negative finding, and it gets worse as guidance gets stronger.

**Conclusions that are unsafe at this sample size**
1. D beats C2 overall. The gap is 74 vs 68 out of 96, and most of it comes from two cells.
2. D fixes H4. C2 passes 2/8 and D passes 6/8. Fisher two-sided p is about 0.13.
3. D improves T7. C2 passes 4/8 and D passes 7/8. p is about 0.3.
4. D regresses T6. C2 passes 8/8 and D passes 6/8, with 2 code:noedit fails. p is about 0.47. This should be watched but not concluded.
5. C2 hurts the ceiling check on H5. C fails code:ceiling 2/8 times and C2 fails it 7/8 times. p is about 0.04. Around 12 tasks, 4 configs and 10 checks give hundreds of comparisons, so a result like this is expected by chance. Treat it as a hypothesis.
6. Small judge_mean gaps mean nothing. Gaps of 0.25 to 0.5 on a 7-point scale with 8 trials are within noise.
7. Wilson 95% intervals show the limits. A cell at 8/8 is only shown to be above about 0.68. A cell at 0/8 is only shown to be below about 0.32. A cell at 6/8 spans roughly 0.41 to 0.93.
8. The 8 trials per cell reuse one scenario wording. They are not independent draws across scenario space. For generalization the real n is 12 tasks, not 96 runs.

**Ceiling and floor effects**
1. There is a ceiling on T1 to T5 for C2 and D. Almost every cell is 8/8 with judge 7.0, so these tasks cannot tell C2 from D.
2. There is a floor for A on the code checks. Checks such as spec_table, pred_file, band, source_col, log_cols and tag look for SPE vocabulary that A was never given. A's 0/8 cells measure missing vocabulary, not bad judgment. A is only a fair baseline on judge items that score behavior.
3. H5 is at the floor for every config. A, C, C2 and D all pass 0/8, and judge items 4 and 7 fail 8/8 in every config. Either no config's text covers what those items reward, or the items cannot be met as written. The eval cannot say which.
4. H4 judge:7 is at the floor for A, C and C2. Only D clears it. That is one data point for the D children, not proof.
5. T6 does not discriminate. A already passes 6/8 without guidance.
6. T7 judge:6 fails in every guided config: C 7/8, C2 5/8, D 3/8. The guidance has a persistent gap here, or the item is ambiguous.

**What this eval could not show**
1. Action. Workers had no tools, so the eval scored stated intent. It cannot show that a prediction file exists on disk before the run, that the order of operations held, or that the grader was left unedited.
2. Real plan mode. Plan mode was simulated. Real plan mode blocks writes and requires approval through the UI. T1 and T7 test a description of plan mode, not the harness behavior.
3. Real hook disclosure. If the harness handed D the correct child for each task, D had an oracle trigger. Real trigger matching can misfire, fire late, or fire on H3. D's score is an upper bound.
4. Multi-turn behavior. The loop really spans many turns and compactions. The eval cannot show drift, re-firing after compaction, or decay over a long overnight run, which matters for T5.
5. Other models. Only Opus ran as worker. Sonnet and future releases are untested, which is ironic given H4.
6. Cost. Tokens per response and response length were not measured. Ceremony on H3 probably shows up as length.
7. The pass rule. The results do not state how pass is defined. C-H2 passes 4/8 while failing judge:2 8/8, and C-T3 passes 8/8 while failing judge:1 twice. So pass seems to be all code checks plus a judge threshold. Pass rates shift with that threshold, and it should be reported.

**Threats to validity**
1. The judge is from the same model family. An Opus judge scores Opus workers. It may share their blind spots and prefer their phrasing. Nothing was calibrated against human labels.
2. Blinding is weak. Guided outputs use words like "bands", "dry run" and "critic", which tell the judge which arm it is reading.
3. The tests are circular. The rubric, the regexes and the guidance probably came from the same author and the same mental model. Guided arms get rewarded for echoing the guidance, and the tests measure fidelity to the text more than good loop behavior.
4. Held-out tasks are missing. The D children were revised after r01, likely against these same 12 scenarios, so D's gains may be overfit to the wording.
5. Content and structure are confounded. D carries more total text than C2. A gain for D could come from extra content, not from splitting it by moment.
6. Guidance framing differs from production. Where the guidance sits in the eval (system prompt or user turn) may not match how a hook injects it mid-session in real use. Hook-injected text can carry different weight.
7. The regexes have not been audited. code:no_ceremony may fail a response that names the loop only in passing. code:same_tasks and code:ceiling may miss paraphrases. Code and judge results were never cross-checked for agreement.
8. There is one control task. One H3 cannot separate scope bleed in general from this one scenario's framing. The "mid-loop" setup may push workers to treat SPE as expected.

**What the next round should add or change**
1. Fix scope first. Add an explicit rule that SPE ceremony applies only to loop moments, and that unrelated or adjacent requests get a plain answer. Expand the controls to 3 or 4 tasks:
   - an unrelated request
   - an adjacent non-SPE edit, such as a typo in a grader comment
   - a read-only question about the results
   - a request with SPE vocabulary but no loop.
2. Diagnose H5 before rerunning it. Read items 4 and 7 against every config's text. If the guidance has a gap, write the saturation rule: raise the ceiling, add harder tasks, and state the next round. If the items cannot be met, rewrite them.
3. Retire or harden T1 to T5 for C2 and D. Add variants that include conflicting instructions, partial state, distracting context, or a misleading earlier log.
4. Add a D-flat arm. This is the C2 root plus all D children in one file. It separates structure from content.
5. Add a real-trigger arm for D. Run the real hook matcher, and include runs where the wrong child fires or no child fires.
6. Write held-out paraphrases. Make 2 or 3 new wordings per task, unseen during revision. Score them separately from the original wordings.
7. Calibrate the judge. Hand-label about 40 transcripts, weighted toward H3, H5, T7 and H4. Report kappa against the Opus judge. Add a second judge from a different family on the same subset if that is allowed. Report code-judge agreement per check.
8. Run a small set of trials with tools. Use real Claude Code sessions with plan mode on T1, T7, H2 and T6, at n of 3 to 4 each. Check artifacts on disk and their timestamps.
9. Put trials where the signal is. Take contested cells (H4, T7, T6, H2 and the new controls) to n of 16 to 20. Leave settled cells at 8. Report Wilson intervals and correct for multiple comparisons.
10. Run Sonnet as a worker on the C2 and D arms.
11. Record response length and token counts per cell, especially on the controls.
12. Re-score A on the judge items only. Then the A baseline compares behavior, not vocabulary.
13. Pre-register predictions for the next round, with expected pass bands per cell. The loop under test requires this, so the eval should do it too.

The brief asks what "round 2" should add, but these results are already r02. I read it as the next round, r03.
