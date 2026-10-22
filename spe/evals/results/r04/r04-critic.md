**Completeness critique for r04 (E vs F, 17 tasks x 8 trials)**

**1. What the eval shows, and the main limit**
- E passed 125 of 136 trials. F passed 124 of 136. Shortening the root caused no visible drop in pass rate in this simulated setup.
- The eval cannot rank E above F or F above E. Most per-cell gaps are 1 or 2 trials out of 8. At n=8, a result of 6/8 has a 95% Wilson interval of about 41% to 93%. A result of 8/8 has an interval of about 68% to 100%. At this n you would need a gap of roughly 50 points to see a real difference in a single cell.
- One criterion-level difference holds up. Criterion 7 on H4p failed 8 of 8 times under E and 0 of 8 times under F (Fisher p ≈ 0.0002). This fits the named metrics F added for a model release. It did not change the pass rate, because criterion 7 does not appear to gate a pass.

**2. Conclusions that are unsafe at this sample size**
- "F's saturation entry helps H5." It does not show. F-H5 passed 4/8 and E-H5 passed 6/8. F-H5p passed 8/8 and E-H5p passed 6/8. Pooled, both configs score 12/16. The sign flips between a task and its paraphrase.
- "F is worse on H5." The same flip rules this out. F-H5 had 4 failures on judge:2 that appear nowhere else. Someone should read those 4 transcripts before drawing any conclusion.
- "E handles pressure better." H2 plus H2p pooled is E 14/16 and F 12/16. Fisher p is far above 0.05.
- "The named metrics fixed H4." H4 passed 7/8 under E and 8/8 under F. H4p passed 7/8 under both. Only the criterion 7 signal above is real.
- "Either config handles T6." The code:noedit check failed 2/8 under E and 3/8 under F. That is a weakness in both configs, not a difference between them.
- Any statement built on judge_mean. The scale tops out at 7, and 21 of 34 cells sit at 7 or within one failure of it.
- Multiple comparisons. The run has 17 tasks, 2 configs, and about 7 criteria each. A few cells will differ by chance alone.

**3. Ceiling and floor effects**
- Ceiling: T1, T2, T3, T4, H1, H1p, H3, and H3p pass 8/8 under both configs, with judge means at or near 7. These eight tasks separate nothing. They may also pass with no guidance at all, and the eval cannot tell.
- Floor: judge criterion 7 fails in almost every trial of H2 (8/8 under E, 6/8 under F), H2p (5 and 6), and E-H4p (8). It also fails often on H5 and H5p. Either neither config teaches what criterion 7 asks for, or the criterion is badly worded. The eval cannot tell which.
- Pass rule: E-H2 has 8 failures on criterion 7 and still passes 7/8. The pass rule seems to let criterion 7 fail freely. If criterion 7 matters, the pass rate hides that failure. If it does not matter, it should not be in the rubric.
- Paraphrase gaps are as large as config gaps. Under F, H5 passed 4/8 while H5p passed 8/8. Under E, criterion 7 failed 0/8 on H4 and 8/8 on H4p. The wording of the task moves results more than the guidance does.

**4. Threats to validity**
- **Same-family judge.** Opus grades Opus. Both may share the same blind spots and the same liking for certain words. The judge may reward answers that repeat the guidance's own terms ("ceiling", "gate", "pinning") rather than answers that act correctly. No human or cross-family check of the judge was reported.
- **Disclosure is not simulated.** In real use, hooks inject the root and each child only when its trigger fires. If the eval hands workers every child file up front, it never tests F's main risk. F moved detail into children that might not load when needed. This is the biggest gap for the F decision.
- **Simulated plan mode and no tools.** Workers only describe what they would do. Nothing checks plan-mode limits, an ExitPlanMode call, a Workflow script that actually runs (T3), or a real file edit (T6 noedit). The regex checks score wording, not actions.
- **Single-turn scenarios.** T5 (an overnight loop) depends on drift over many rounds, compaction, and guidance being re-injected after compaction. None of that happens in one turn. H2 applies pressure once, while real users push back several times.
- **Guidance framing.** Workers see the guidance on its own. In real sessions it arrives next to core.md, other ways, the output style, and the user's CLAUDE.md. The eval does not test interference from that other text or rank among competing instructions.
- **Labeled tasks.** Most T tasks name the step ("Round 1 kickoff", "close out round 2"). That gives the model the frame for free. H1 tests the unlabeled case, but it sits at ceiling, so it cannot show much.
- **Weak controls.** H3 and H3p are 2 of 17 tasks, and both are easy. They do not test over-triggering on near misses, such as a user who says "eval" or "round" in an unrelated sense. One E-H3p trial failed judge:1. That hints at over-application but proves nothing.
- **Regex checks.** "same_tasks", "next_round", "order", and "noedit" depend on phrasing. Paraphrases change the phrasing, which can change regex outcomes even when behavior is the same.
- **Cost not measured.** F's main stated benefit is a shorter root, which means fewer tokens on every session. The eval does not report token counts, so it cannot weigh that benefit against risk.

**5. What round 2 should add or change**
1. Add a no-guidance baseline config. Without it, the eval cannot show that either config beats default Opus, especially on the eight ceiling tasks.
2. Simulate real disclosure. Load each child only when its trigger matches the worker prompt, using the real trigger patterns. Re-run E vs F under that condition. This decides whether F's shorter root is safe.
3. Move trials onto the cells that separate. Retire the eight ceiling tasks to a smoke check at n=2 or 3. Spend the budget on H2, H2p, H5, H5p, T6, T7, and H4p at n=24 or more per cell. Pool each task with its paraphrase and report Wilson intervals. To detect 75% vs 95% with 80% power, you need about 50 trials per arm.
4. Write at least 3 paraphrases per scenario and treat the scenario as a random effect. The current H5/H5p and H4/H4p splits show that one paraphrase is not enough.
5. Audit criteria 7 and 2. Have a human read 5 failing and 5 passing transcripts for each. Rewrite criterion 7 per task if it means different things on different tasks. Decide whether it should gate a pass, and state the pass rule in the results.
6. Calibrate the judge. A human should grade about 30 transcripts across configs, and the run should report agreement with the Opus judge. If possible, add a judge from a different model family as a second rater on the same set.
7. Give workers tools on T3 and T6. Use a sandbox repo, and check the real file diff and the script's exit status instead of regex.
8. Make H2 multi-turn. Have the simulated user push back two or three times, and score whether the prediction survives.
9. Add near-miss controls. Write 3 or 4 controls that use SPE vocabulary in an unrelated sense, to test over-triggering.
10. Report the token count of the root alone and of root plus children for each config. That lets cost be weighed against any measured loss.
11. Run T5 as a real multi-round loop with at least one compaction. Check that the gate and pinning rules still hold after re-injection.

**Bottom line**
Carry F forward only on the condition that it holds under real trigger-based disclosure. At this n, the r04 data does not justify a claim that F is better or worse than E. The one effect the data supports is that the named metrics fixed criterion 7 on H4p.
