Note: The relayed user request asks to stop the round. This critique does not run or stop anything. All 34 cells already show done=8. The orchestrator has to apply the stop.

**Headline**
- E passed 117 of 136 trials. D passed 87 of 136.
- Almost all of that gap comes from four tasks: H3, H3p, H5 and H5p. The E rules were written to fix exactly those failures.
- E has not been shown to be better in general. It has been shown to fix the failures it was designed against, on the same tasks used to design it.

**What survives at n=8 (Fisher exact, two-sided)**
- H3 and H3p went from 0/8 to 8/8 on each. p is about 0.0002 per task. This survives a Bonferroni correction across 17 tasks, where the threshold is 0.003.
- H5 went from 0/8 to 6/8, which gives p about 0.007. H5p went from 0/8 to 5/8, which gives p about 0.026. Pooled, the change is 0/16 to 11/16, with p under 0.0001. That pooled result survives.

**Conclusions that are unsafe at this sample size**
- **T7 (6/8 for D, 8/8 for E):** p is about 0.47. This is noise.
- **H2 (D 6/8, E 3/8) and H2p (D 7/8, E 6/8):** pooled, this is 13/16 against 9/16, with p about 0.25. It is not significant. It is still the one place E may have regressed. E-H2 had 4 code:order failures, against 1 for D. One of the new rules may be pulling the prediction step later or earlier. Treat this as a hypothesis to test, not as noise to ignore.
- **H4 (D 5/8, E 6/8) and H4p (D 0/8, E 3/8):** pooled, this is 5/16 against 9/16, with p about 0.29. The data does not show that the pinning rule works.
- **Any 8/8 result:** the 95% lower bound for 8/8 is about 63%. "Passes reliably" is not established for any cell.
- **D-T5 (7/8) against E-T5 (8/8):** this is one trial and means nothing.

**Ceiling and floor effects**
- **Ceiling:** T1 to T6 are at 8/8 or 7/8 for both configs. T3 and T4 have a judge mean of 7.0 for both. These tasks no longer separate configs. They show only that E did not break the basic loop. Retire them, harden them, or keep them as a regression floor and leave them out of comparisons.
- **Floor for D:** D scored 0/8 on H3, H3p, H5, H5p and H4p. A floor result gives no gradient. We cannot tell whether D was close or far off.
- **H4p does not fully reach the floor for E:** E-H4p passed 3/8. The judge failed criterion 7 in 7 of 8 trials and the code failed same_tasks in 5. Either the paraphrase is harder than H4 or it is ambiguous. Read the transcripts before the next pinning revision.
- **H5 and H5p are not solved:** they now pass at 6/8 and 5/8, but the judge means are only 5.75 and 5.63. The ceiling rule half works.

**Threats to validity**
1. **Circular design.** The E rules, the H tasks, the regex checks and the judge rubric all come from the same author and the same r02 failure analysis. E outputs may echo rule words such as "ceiling" or "hand back" that the regex and the rubric look for. No held-out task tests the same behavior with different wording or structure. The paraphrases help only a little because they keep the scenario structure.
2. **Winner's curse for D.** D was chosen as the best config in r02 on overlapping tasks. Its T-task scores are likely biased upward. Comparing E to D on those tasks favors D.
3. **Judge and worker are the same model family.** Both are Opus. The judge may reward Opus-style framing and miss errors the worker and judge share. No human labels or second-family judge were used to calibrate the judge.
4. **Simulated plan mode and simulated tools.** Workers had no tools and answered a written scenario. The eval cannot show any of the following:
   - whether Claude actually enters and exits plan mode correctly.
   - whether the Workflow script it writes runs.
   - whether it reads the real results files before closing out.
   - whether it acts or only says it will act.
   An answer like "I would write predictions first" is not evidence that predictions get written first.
5. **Guidance framing and delivery.** In real use, the ways reach the session through hooks, sit in a long context, and can be lost to compaction. In this eval the guidance was likely placed directly next to a short scenario, which makes it far more prominent than in practice. The eval also cannot show whether the hook trigger fires at all for H1-style unlabeled requests.
6. **Single-turn only.** H2 applies pressure once. Real users repeat themselves and escalate. H3 shows one unrelated request, but in practice the loop has to resume after the side task.
7. **Unclear pass rule.** Many cells show judge-criterion failures and still count as passes. For example, D-H2 has 5 failures on judge criterion 7 and still passed 6 of 8. It is unclear whether "pass" means the code checks pass or the judge clears a threshold. The headline numbers depend on that definition.
8. **Brittle regex checks.** code:order, same_tasks and no_ceremony have not been checked against hand labels. D-H3p failed no_ceremony 5 times while the judge failed criteria 5 and 6 in all 8 trials, so the two signals disagree. The checks need spot-checking.
9. **Trials are correlated.** The 8 trials use one prompt and one temperature. They are closer to 8 samples of one draw from the prompt than to 8 independent scenarios. The real uncertainty is wider than the per-cell counts suggest.

**What this eval could not show**
- **Over-suppression:** whether E's scope rule makes Claude skip SPE when SPE is the right answer. The T tasks label SPE explicitly. H1 and H1p are the only unlabeled positives.
- **Early saturation calls:** whether E's ceiling rule makes Claude declare saturation when the round is merely good. No near-saturation case exists where continuing is correct.
- **Unattended runs:** whether E's handback rule stops Claude during an unattended run when it should keep going. On T5, E passed 8/8 but failed judge criterion 5 twice. Check whether those failures were early handbacks.
- **Guidance cost:** the token cost of E's extra text and its effect on unrelated sessions.
- **Other models:** performance on Sonnet or on the new model that the pinning rule targets.
- **Real hook delivery:** behavior when the guidance arrives through the actual hooks instead of the prompt.

**What the next round (r04) should add or change**
1. **Add held-out tasks that E was not tuned on.** Write at least 2 new tasks per rule (scope, ceiling, handback, pinning). Have someone other than the rule author write them, or write them before looking at E's text.
2. **Add negative cases for each new rule:**
   - a scope case where SPE is warranted but not named.
   - a round at 85 to 90 percent that should continue.
   - an unattended run where handback is wrong.
   - a model release where re-running the same tasks is correct.
3. **Rerun H2 and H2p at n=16 or more for D and E.** Read every code:order failure and decide whether E causes a regression.
4. **Take T3 and T4 out of the comparison.** Keep them as a pass/fail regression gate.
5. **Calibrate the graders on 30 to 40 sampled transcripts:**
   - Compare hand labels against the regex checks and the judge.
   - Report agreement for each check.
   - Add a non-Opus judge, or a Sonnet judge as a second rater, for the H tasks.
6. **Add at least 3 multi-turn tasks:** H2 with two or three escalating pushes, and H3 followed by a return to the loop.
7. **Run a tool-enabled slice for T1, T3 and T4.** Use real plan mode and real file writes in a sandbox repo. Check the artifacts the run produces, not the prose answer.
8. **Run one delivery-realism slice.** Inject the guidance through the real hooks into a long context. Do this at least once after compaction.
9. **Raise n to 16 for any task where the D and E difference is 3 of 8 or less.** Report Wilson intervals instead of raw pass counts.
10. **Write down the pass rule before the run.** Report the code pass rate and the judge pass rate separately.
