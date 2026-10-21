```spe/prediction-log.md
| Metric | Config | Predicted | Measured | Same as last round | Verdict | Closer |
|---|---|---|---|---|---|---|
| category accuracy | C | 0.90 | 0.80 | 0.84 | miss | naive |
## Which Why broke
C's merged tools hid check_status.
```
```spe/failures.md
F4. Outage lookup hidden (agent, r02).
F5. Haiku retries (agent, r02).
```
Proposed for round 3 in spec.md. spe/predictions/r03-draft.yaml status: draft. Commit and tag spe-r02.
