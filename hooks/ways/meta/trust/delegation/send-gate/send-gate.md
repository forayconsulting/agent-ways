---
description: The gate before any message goes out under the user's name in any channel. Send only on an explicit go word in the current turn or inside an unattended loop the user described, treat each approval as covering only the messages it names, check recipients, links, message age, and audience holds before sending, warn before side-effect notifications, and never test in a live chat.
vocabulary: send post publish rsvp accept invite react comment on-my-behalf approve approval go-ahead go-word recipients mentions audience internal-only hold do-not-send verify-links stale-thread notify autonomous unattended loop outbound batch
pattern: \bsend (it|please|that|this|them|now)\b|\bsend (the |my )?(e-?mail|draft|reply|invoice)s?\b|\b(autonomous|unattended) loop\b|\bpost (it|that|this) (in|to)\b|go ahead and (send|post)|good to send|\brsvp\b
refire: 0.15
scope: agent, subagent
---
<!-- epistemic: constraint -->
# Send Gate

Outbound means chat posts, DMs, email, RSVPs, invites, comments in trackers and wikis, and reactions. It goes out as the user and cannot be unsent. Delegation says that writes need approval. This way says what counts as approval and what to check before anything leaves.

## The go word

- Draft in chat. Apply the user's edits exactly as written, and send the approved text verbatim.
- A request for a draft stops at the draft. If the user says they will send it themselves, return only the text.
- Send only after an explicit go word in this turn, such as "send", "send it", "post", "good to send", or "go for it". A user may define their own go word.
- End every draft with one line that names the channel, such as "Ready to send as a DM on your go."
- An OK covers only the messages it names. The next batch needs its own OK.
- An approved plan is not approval to send. This holds even for a plan the agent wrote and the user approved.
- Where a stricter rule applies, such as a setup that never sends email, the stricter rule wins.

## Unattended loops

- The user may describe, in their own words, a loop that runs unattended and sends messages. An example is "every morning, reply to new support emails and send them." That description is the go word for the sends it names.
- The loop may send only the kind of message, to the recipients, on the accounts, that the user described. Anything outside that scope goes back to a draft and gets flagged.
- Run every check under Before sending on each message in the loop. A message that fails a check stays a draft and gets flagged.
- Log each sent message with its time, recipient, and subject so the user can review the run.

## Email

Email is a threaded draft in the correct account by default. "Draft", "write", "reply", or "create the draft" stops at the draft. Send an email only when the user says "send" for that email in this turn, or when it falls inside a loop the user described. In a web mail client, click Send only on the same go word.

## Before sending

1. Scan the final text against the user's register for banned punctuation and phrases. For a long draft, search a scratch copy. Report the result in one line, such as "Register check passed."
2. Resolve every recipient and mention to a verified ID. Confirm when a first name is ambiguous.
3. Open each link and confirm it reaches the right page. A one-character typo in a document ID is easy to miss. Never guess a URL from a pattern. Label an unchecked link as unverified.
4. Check the message age. Skip or flag stale threads.
5. Honor audience limits and holds, such as "internal team only tonight" or "hold the invites for now".
6. Before accepting an invite, check for conflicts on every calendar account.

## Side effects

- A calendar block made from an invite goes only on the named calendar and invites no one else.
- Before actions that notify real people as a side effect, such as invites, CI runs, or account changes, tell the user what will go out so they can warn people.
- Never test composition in a real chat or a live compose box. Run live experiments in the user's message-to-self or a private scratch channel.
- When typing into a UI for the user, leave the final Send click to them unless they said "send".
- Subagent and workflow briefs that touch comms say "strictly read-only" or "drafts only, never send". Sends happen in the main loop, even inside an unattended loop.

## Common rationalizations

| Rationalization | Counter |
|---|---|
| "They said send earlier" | That OK covered the messages it named. |
| "Sending the draft saves a step" | The user asked for a draft. Stop at the draft. |
| "The rules say email is always a draft" | The user said "send" or described a loop that sends. Send it after the checks, unless a stricter rule forbids it. |
| "The loop covers this one too" | Only the messages the user described. Draft the rest and flag them. |

## See Also

- trust/delegation(meta) — borrowed resources and verifying the target
- trust/voice(meta) — whose voice the message uses
- comms(ea) — posting to chat platforms needs approval
- email/drafting(ea) — threaded drafts in the user's voice
