# Freedom Race (Tradervert Edition) — rules for Claude sessions

Read this before touching anything. Agent teams also read `docs/agent-teams/OPERATING-RULES.md`.

## What this repo is

- **One file is the game:** `index.html` (~16k lines, ~1.1 MB): CSS, data tables, engine, UI, multiplayer,
  shop, trophies, telemetry. No build step, no bundler, no framework. Edit and refresh.
- **`main` is live.** GitHub Pages serves the repo root at https://aiejandrog.github.io/cashflow-tradervert/
  and redeploys about 40 s after every push to `main`. A merge is a release.
- **itch.io** mirror: https://tradervert.itch.io/freedom-race (manual upload of `freedom-race.zip` from
  `node build-zip.cjs`; see `PUBLISH.md`). The `freedomrace.itch.io` URL in older notes redirects there.
- **External services the page uses (CDN, no server of ours):** PeerJS (WebRTC rooms across devices),
  Supabase REST (`cf_rooms`, `cf_profiles`, `cf_sessions`: room directory, cloud-sync profiles, anonymous
  session stats), Tenor (GIF search), YouTube iframe API (room music), ipify (hashed IP for the device id).
  Solo and same-device play need none of them; `node tools/smoke.cjs --offline` proves it.
- **Public repo.** Nothing personal goes in: no phone numbers, emails, real player names, keys other than
  the two public client keys already in the file. Fixtures use invented people.

## Commands

| | |
|---|---|
| `npm install` once, then `npx playwright install chromium` once | dev tooling only; the game has no runtime deps |
| `node game.test.js` (or `npm test`) | pure-logic tests; the harness evals `index.html` under a DOM mock |
| `node tools/smoke.cjs` / `--offline` | headless load: 0 console errors, 0 page errors, screenshots at 1280x800 and 375x812 |
| `node build-zip.cjs` | `freedom-race.zip` for itch (index.html at the zip root) |
| `npx -y http-server -p 8742 -c-1` | local server; `.claude/launch.json` has the same for the preview pane |

Known on 2026-11-08: 5 tests in `game.test.js` fail against v1.29.0 (default city, NY salary multiplier,
Houston/LA expenses, Subscription Creep cost, school-milestone turn). They are assertions written in May
2026 against earlier data. Whether the test or the game is wrong is an open ticket; do not silently edit
either to make them agree.

## Rules

1. **Never push to `main`.** Branch `claude/<topic>`, PR, Alex merges. Releases follow the ritual in
   `PUBLISH.md`: bump `GAME_VERSION`, add to `CHANGELOG.md` **and** the in-game `CHANGELOG` array.
   Feature and fix PRs do **not** bump the version; they add a line under `## Unreleased` in `CHANGELOG.md`.
   One release PR per batch does the bump and mirrors the entries into the in-game array.
2. **Small edits to `index.html`.** One function or block per Edit. Never `Write` the whole file. Never
   reformat, re-indent, reorder or "clean up" code you were not asked to change: another branch is editing
   the same file and every unrelated changed line is a conflict.
3. **Invariants:** single file, no build, no new CDN libraries, native system emoji for icons (the OpenMoji /
   game-icons packs were reverted in v1.26 at Alex's request: do not bring them back).
4. **Money math is tested math.** A change to `income()`, `expenses()`, `monthlyCF()`, credit tiers,
   loan terms, deal pools, dream costs or payday needs a pure-logic test in `game.test.js` in the same PR.
5. **Multiplayer changes carry "needs 2-device playtest" in the PR body.** Two tabs on one machine
   (BroadcastChannel) is the most a headless or single-machine test can prove; the PeerJS path is not covered.
6. **Keys, endpoints, telemetry, Supabase tables, Tenor, itch, monetization copy: Alex only.** Report, do
   not change. The agent guard (`tools/agent_guard.py`) enforces this for team sessions.
7. **Test before claiming.** `node game.test.js` and `node tools/smoke.cjs --offline` output goes in the PR
   body. "Verified" without pasted output is not verified.
8. **$0.** No paid services, no new accounts, no schema changes.

## Agent teams

Roles live in `.claude/agents/` (chief, qa, mp, sec, balance, ideas, fixer, gate). The paste that starts a
run, the setup paste for the guard and the wave plan are in `docs/agent-teams/TEAM-PROMPT.md`. Ticket format,
severities, board and merge classes: `docs/agent-teams/PROTOCOL.md`. Run records are exported, scrubbed, to
`docs/agent-teams/runs/<run>/`.
