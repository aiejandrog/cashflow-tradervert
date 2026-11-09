# Audit loop protocol: tickets, board, logs, merge classes

Used by `TEAM-PROMPT.md` and every role it spawns. Read after `OPERATING-RULES.md`. Plain English, counts
and ticket ids; invented players in fixtures.

## 1. Where things live

| what | where | committed? |
|---|---|---|
| Run folder | `%USERPROFILE%\.freedom-race\agent-logs\<run>\` (`<run>` = `FR_AGENT_RUN_ID`, default today's UTC date) | no |
| Flight recorder | `<run>\events.jsonl`, one scrubbed line per tool call, prompt, stop; guard blocks marked `BLOCKED` | no |
| Transcripts | `<run>\transcripts\` copied on every Stop / SubagentStop. **Raw, not scrubbed** | never |
| Ticket board | `<run>\BOARD.md`, owned by `chief` | scrubbed copy at the end |
| Work logs | `<run>\worklog-<name>.md`, one per agent, owned by that agent | scrubbed copy at the end |
| Screenshots | `<run>\shots\<agent>-<what>.png` (from `tools/smoke.cjs --out` or Playwright) | no (paths in tickets) |
| Report, autopsy, digest | `<run>\REPORT.md` (chief), `AUTOPSY.md` (if run), `digest.md` (recorder) | scrubbed copy at the end |
| Final record | `docs/agent-teams/runs/<run>/` via `python tools/agent_guard.py export <run> <dest>`, one draft PR `docs: agent loop <run> records (no code)` | yes |

## 2. Ticket format (one block per ticket, in the author's worklog, then messaged to `chief`)

```
### <ID>  <one-line title>
- Type: FINDING | IDEA | PROCESS
- Area: engine | money | deals | board-ui | mobile | onboarding | multiplayer | shop-trophies | save-load | telemetry-security | content | release | process
- Severity: S1 | S2 | S3 | S4 | S5        (FINDING only; section 3)
- Evidence: index.html:line (or file:line), the exact command, output excerpt or screenshot path
- Repro: steps another agent can run headless or in two tabs, from a fresh localStorage
- Proposed fix (smallest): what changes, in which function, and the test in game.test.js that would prove it
- Touches: none | money-math | multiplayer | save-format | keys/telemetry | balance | copy   (all that apply)
- Confidence: high | medium | low, and why
```

IDs: `F-<agent>-NN` for findings (`F-sec-03`), `I-NN` for ideas, `P-NN` for process tickets.
IDEA adds: `Maya test` (one sentence: what she does differently), `Benchmark` (which of the three does
this and how), `Expected effect` (prefix `guess:` when not measured), `Effort S/M/L`, `$ cost` (must be 0).

## 3. Severity (the order Alex reads)

| | meaning | example |
|---|---|---|
| S1 | game-breaking: crash, stuck turn, save lost or corrupted, cannot win when the win condition is met, MP seat lost | ROLL does nothing after dismissing a modal |
| S2 | wrong money: any dollar figure, rate or cash-flow shown or applied incorrectly | tenant rent ignores the mortgage |
| S3 | multiplayer desync or turn-order fault, reconnect loses state | opponent can act out of turn |
| S4 | security or privacy: HTML injection via a player or room name, key misuse, telemetry beyond the stated "no PII" | room name rendered with innerHTML unescaped |
| S5 | everything else: layout, copy, polish, dead button that has a workaround | shop label truncated at 375px |

## 4. Ticket states (only `chief` moves a ticket)

```
NEW -> NEEDS-INFO (max 1 round trip) -> NEW
NEW -> DENIED (reason) | DUPLICATE (of id) | APPROVED-REPORT (goes to Alex, no code)
NEW -> APPROVED-FIX -> IN-FIX (fixer, branch) -> QA-FAIL (back to fixer, max 3) -> FAILED (to autopsy)
                                             -> QA-PASS (gate) -> SHIPPED-PR (chief accepted scope)
```

## 5. BOARD.md (chief)

```
# Board <run>   baseline: origin/main @ <sha>, game.test.js on main: <N pass / M fail, ids>, smoke: PASS/FAIL
| id | type | sev | area | author | state | branch / PR | merge class | note |
```
Below the table, `## Conversation`: one line per message that changed a state
(`ts  chief -> qa  F-qa-02 NEEDS-INFO: fresh localStorage or a saved game?`).

## 6. Work log (every agent, its own file)

Append, never rewrite. One line per meaningful step: `ts  <verb>  <what>  <proof>`
(`18:40 RAN node game.test.js -> 41 pass 5 fail (known)`). Every hand-off gets a line (`-> chief F-qa-04 READY`).

## 7. Merge classes (on every PR body; `chief` merges)

- `Merge: chief hold`: the diff touches money math, multiplayer, save format, balance numbers, keys or
  telemetry, player-facing copy about money or following, or the PR needs a 2-device playtest. `chief`
  does not merge these until Alex says go in the run prompt.
- `Merge: chief auto`: clean QA PASS from `gate`, scope accepted by `chief`, none of the above. `chief`
  merges it without asking.
Every PR body also carries: plain-English summary, the ticket id, pasted output of `node game.test.js`
and `node tools/smoke.cjs --offline`, tests not run and why, `Touches:`, and the line
"Merged is live on Pages within a minute; itch needs the manual upload (PUBLISH.md)".

## 8. The guard (`tools/agent_guard.py`)

Installed by Alex's setup paste, never by an agent. It refuses (exit 2) the actions in section 1 of
`OPERATING-RULES.md` plus edits to report-only files, and logs every attempt. Never reword a command to
get around it; the digest lists every block and `chief` reads them.
