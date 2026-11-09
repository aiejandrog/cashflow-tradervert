# Operating rules for agent teams on Freedom Race (2026-11-08)

Every teammate reads this first. Where it is stricter than a role file, it wins. `CLAUDE.md` holds the
repo facts; this file holds what a team may and may not do.

## 1. `main` is the live game — and `chief` ships to it

GitHub Pages deploys the repo root on every push to `main`, to every player, in about 40 seconds.
That is the point: the team ships.

- `chief` is the merge authority. `chief` merges any PR that carries a clean `gate` PASS and `chief`'s own
  scope acceptance, using `gh pr merge <n> --squash --delete-branch`. No other role merges.
- Everyone else: work in your own worktree on `claude/<role>-<ticket>` branched from `origin/main`. Push
  only that branch (`git push -u origin claude/...`). Open a PR. `gate` writes PASS or FAIL. `chief`
  accepts scope and merges.
- Force-push and history rewrite stay banned for every role. They destroy other agents' work; a merge does
  not. `tools/agent_guard.py` still refuses `--force`, `--force-with-lease`, `git reset --hard`,
  `git rebase -i` and branch deletion.
- Repo settings, Pages config, GitHub releases, itch (`butler`), npm and Supabase stay Alex-only.
- A BLOCKED line is not a crash: read the reason and do the allowed thing.
## 2. One file, many hands

`index.html` is the whole game. Parallel edits collide unless everyone is disciplined.

- One ticket per branch, one fixer per ticket. Edit the smallest range that fixes the ticket: one function
  or block per `Edit`. Never `Write` the file whole. The guard refuses an `index.html` edit over 12,000
  characters; split it.
- Never reformat, re-indent, reorder, rename for taste, or fix something you noticed next door. Write a
  ticket for it. Every unrelated changed line is a conflict for someone else.
- `git fetch origin && git rebase origin/main` before you open the PR and again before `gate` runs.
  A PR that does not apply cleanly on `origin/main` is QA-FAIL.
- `chief` decides order and merges: two PRs that touch the same function are serialized, the
  second rebases after the first lands.

## 3. Versions and changelog

Fix and feature PRs do **not** bump `GAME_VERSION` and do **not** edit the in-game `CHANGELOG` array
(both are one line that every PR would fight over). They add a line under `## Unreleased` at the top of
`CHANGELOG.md`. After `chief` merges a batch, `gate` opens one release PR: bump `GAME_VERSION`, turn
`## Unreleased` into `## vX.Y.Z — date — title`, mirror the player-facing lines into the in-game array,
run tests + smoke. `chief` merges that, then Alex does the itch upload and devlog by hand (`PUBLISH.md`).

## 4. Invariants nobody changes without Alex

- Single file, no build step, no new CDN libraries, no fonts added.
- Native system emoji for icons. The OpenMoji (v1.24) and game-icons (v1.25) packs were reverted in
  v1.26 at Alex's request. Do not reintroduce an icon pack.
- Keys (`ROOMS_KEY`, `TENOR_KEY`), endpoints (`*_URL`, `supabase.co`), telemetry (`logSession`,
  `_ipHash`, `cf_sessions`), Supabase tables and RLS, monetization and follow copy (`MONETIZE.md`,
  win-screen asks), `PUBLISH.md`, `promo/`, `build-zip.cjs`, `.github/`. Report-only; the guard enforces
  the files, the rule covers the rest.
- Game balance numbers (salaries, deal pools, dream costs, credit tiers, mystery-box weights) change only
  on an APPROVED-FIX ticket with a before/after simulation attached.

## 5. Evidence or it did not happen

- Every finding carries file:line, the exact command, and the output excerpt or a screenshot path.
- Every PR body carries the pasted output of `node game.test.js` and `node tools/smoke.cjs --offline`,
  plus the tests you did not run and why.
- A pure-logic change (money, credit, deals, turns, win condition) ships with a test in `game.test.js`.
- Multiplayer: two tabs on one machine via BroadcastChannel is the most a team can prove. Every MP PR
  says **"needs 2-device playtest"** in its body and is `Merge: chief hold`.
- "Verified in my head" is not a status. `gate` re-runs your commands itself; PASS carries gate's output.

## 6. Cost and scope

- Sonnet for every teammate. At most 4 teammates alive at once. Alex can say "stop after wave N".
- $0: no paid services, accounts, API calls from scripts, or browser extensions. The game page may call
  its own CDNs while a tester plays it; a script may not call Supabase, Tenor, itch, ipify or PeerJS.
- Public repo. No real names, phones, emails. Test players are invented. Logs and transcripts live in
  `%USERPROFILE%\.freedom-race\agent-logs\`, never in the repo; only the scrubbed `*.md` records are
  exported (`tools/agent_guard.py export`).

## 7. Quality bar (defaults Alex can overwrite in the run prompt)

- **Benchmarks:** CASHFLOW Classic (the official web game: the rules players expect), Monopoly GO (the
  polish and feedback a 2026 board game on a phone is judged against), BitLife (one-tap pacing, a new
  thing every few seconds). Audit the gap to these; do not invent a fourth.
- **Named human:** Maya, 24, finds the itch link on r/WebGames on her phone, has three minutes on the bus,
  has never played Cashflow. Every idea and every fix answers: does she get past turn 3, understand what
  she is trying to do, and send the link to a friend? Second seat: Alex's friend joining a room from his
  own phone while Alex hosts. If an idea does not move one of those two, it is S5 at best.

## 8. When in doubt

Write it in `DECISIONS-NEEDED.md` (append only: question, options, risk of each, recommendation, what you
did instead) and move on to your fallback. Nothing ships, spends or changes a rule without Alex.
