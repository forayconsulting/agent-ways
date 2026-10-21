Gates: grade.py selftest, regrade round 3 as control, dry run with args.only.
```js
export const meta = { name: 'r04', description: 'round eval', phases: [{ title: 'Trials' }, { title: 'Synthesis' }] }
const ROUND = args.round
const CAP = 40
const R = { type: 'object', properties: {}, required: [] }
await agent('trial', { schema: R })
await agent('completeness critic', {})
```
