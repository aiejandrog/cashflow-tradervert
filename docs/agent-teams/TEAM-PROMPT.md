# Freedom Race agent loop: setup paste + team prompt (2026-11-08)

Roles: `.claude/agents/` (qa-chief, game-qa, mp-qa, balance-auditor, security-auditor, ux-scout, fixer,
release-gate). Rules: `OPERATING-RULES.md`. Tickets, board, merge classes: `PROTOCOL.md`.

**Cost, once:** a full run is about 8 to 10 Sonnet contexts over five waves, at most 4 teammates alive at
a time. Say "stop after wave N" at any point. chief merges as PRs pass; you are not in the loop.

## The flow

```
 wave 0  PROBE + BASELINE   main proves the guard allows merge; chief records main's test/smoke baseline
 wave 1  AUDIT              qa (solo playtest) + mp (two-tab multiplayer) + sec (injection, keys, telemetry)
                            then balance (economy sim, the 5 red tests)      -> tickets -> chief triage
 wave 2  IDEAS              ideas reads qa's Maya moments -> I-NN tickets -> chief approves <= 3 to fix
 wave 3  FIX                fixer-<id> per APPROVED-FIX, own worktree, draft PR -> gate PASS/FAIL -> chief scope
                            chief merges every Merge: chief auto PR; holds Merge: chief hold for you.
 wave 4  RELEASE            gate opens one release PR (version bump + changelog mirror); chief merges it
 wave 5  REPORT             chief REPORT.md; main exports scrubbed records -> one docs PR
```

## Setup paste (PowerShell 7, `pwsh`, one paste, on the machine where the team will run)

What it does: copies the guard from `origin/main` (or this PR's branch `claude/agent-team-setup` before
it merges) to `%USERPROFILE%\.freedom-race\agent-hooks\agent_guard.py`; registers it as a hook in the
main checkout's `.claude\settings.local.json` (this machine only, kept out of git via `.git\info\exclude`
and `.gitignore`); turns on agent teams in your user settings if off; creates the log folder; proves the
guard blocks `git push origin main` and allows `git status`. It changes no permission mode, starts
nothing, pushes nothing. Backups: `*.bak-<timestamp>`. Undo: copy the backups back and delete the hook file.

```powershell
$ErrorActionPreference='Stop'; $repo="$env:USERPROFILE\projects\cashflow-tradervert"; if(-not (Test-Path "$repo\.git")){throw "Repo not found at $repo. Edit the first line to your clone path and paste again."}; Set-Location $repo; git fetch -q origin 2>$null; $src=$null; foreach($r in 'origin/main','origin/claude/agent-team-setup'){ git cat-file -e "${r}:tools/agent_guard.py" 2>$null; if($LASTEXITCODE -eq 0){$src=$r; break} }; if(-not $src){throw 'tools/agent_guard.py is not on origin/main or the setup branch yet.'}; $hd="$env:USERPROFILE\.freedom-race\agent-hooks"; New-Item -ItemType Directory -Force $hd,"$env:USERPROFILE\.freedom-race\agent-logs" | Out-Null; $hook="$hd\agent_guard.py"; (git --no-pager show "${src}:tools/agent_guard.py") -join "`n" | Set-Content $hook -Encoding utf8; $ts=Get-Date -Format yyyyMMdd-HHmmss; New-Item -ItemType Directory -Force "$repo\.claude" | Out-Null; $sl="$repo\.claude\settings.local.json"; if(Test-Path $sl){Copy-Item $sl "$sl.bak-$ts"; $s=Get-Content $sl -Raw | ConvertFrom-Json -AsHashtable}else{$s=@{}}; if(-not $s){$s=@{}}; $cmd='python "' + ($hook -replace '\\','/') + '"'; $h=@{type='command'; command=$cmd; timeout=20}; if(-not $s.hooks){$s.hooks=@{}}; foreach($e in 'PreToolUse','PostToolUse'){ $s.hooks[$e]=@(@{matcher='*'; hooks=@($h)}) }; foreach($e in 'UserPromptSubmit','Stop','SubagentStop','SessionEnd','TeammateIdle','TaskCompleted'){ $s.hooks[$e]=@(@{hooks=@($h)}) }; $s | ConvertTo-Json -Depth 20 | Set-Content $sl -Encoding utf8; $ex="$repo\.git\info\exclude"; if(-not (Test-Path $ex) -or -not (Select-String -Path $ex -SimpleMatch '.claude/settings.local.json' -Quiet)){Add-Content $ex '.claude/settings.local.json'}; $us="$env:USERPROFILE\.claude\settings.json"; New-Item -ItemType Directory -Force (Split-Path $us) | Out-Null; if(Test-Path $us){$u=Get-Content $us -Raw | ConvertFrom-Json -AsHashtable}else{$u=@{}}; if(-not $u){$u=@{}}; if(-not $u.env){$u.env=@{}}; if($u.env['CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS'] -ne '1'){ if(Test-Path $us){Copy-Item $us "$us.bak-$ts"}; $u.env['CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS']='1'; $u | ConvertTo-Json -Depth 20 | Set-Content $us -Encoding utf8; 'Agent teams: turned ON in user settings' } else { 'Agent teams: already on' }; $env:FR_AGENT_RUN_ID='setup-smoke'; '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git push origin main"}}' | python $hook 2>$null; $b=$LASTEXITCODE; '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git status"}}' | python $hook; $a=$LASTEXITCODE; Remove-Item Env:FR_AGENT_RUN_ID; if($b -eq 2 -and $a -eq 0){"GUARD OK (blocked push to main, allowed git status). Guard from $src. Hook file $hook"}else{"GUARD FAILED: block exit=$b allow exit=$a. Check that 'python' runs from this shell. Do NOT start the team."}; "Settings: $sl"; if(-not (Test-Path "$repo\node_modules\playwright")){ 'Next: npm install && npx playwright install chromium  (dev tooling for the smoke check and playtests)' }; git --no-pager status -sb | Select-Object -First 3
```

Then open a new Claude Code chat **at the repo root** (`projects\cashflow-tradervert`), run `/hooks` and
check PreToolUse lists `agent_guard.py`, then paste the team prompt below. Sessions already open do not
pick the hook up until restarted.

## Team prompt (paste into the new Claude Code chat)

```
FREEDOM RACE AUDIT LOOP. Repo root = this folder (main checkout of aiejandrog/cashflow-tradervert).
You are "main", the Lead. You coordinate, spawn, shut down, serialize and export. You do not audit,
fix or review code yourself. Wait for teammates.

READ FIRST (you, and tell every teammate to read them in its spawn prompt):
CLAUDE.md, docs/agent-teams/OPERATING-RULES.md, docs/agent-teams/PROTOCOL.md, and its own role file
under .claude/agents/.
RUN = today's date (YYYY-MM-DD). RUNDIR = %USERPROFILE%\.freedom-race\agent-logs\<RUN>.
HOOK = %USERPROFILE%\.freedom-race\agent-hooks\agent_guard.py. Export FR_AGENT_RUN_ID=<RUN> to every
teammate (put it in the spawn prompt: "run `$env:FR_AGENT_RUN_ID='<RUN>'` / `export FR_AGENT_RUN_ID=<RUN>`
first").
Model for every teammate: sonnet. Never more than 4 teammates alive at once.
Quality bar for everyone: OPERATING-RULES section 7 (CASHFLOW Classic / Monopoly GO / BitLife; Maya on
the bus; Alex's friend joining a room). If Alex adds or replaces benchmarks or the named human in this
message, those win.

WAVE 0a  PROBE (you, before anything else)
  Run: gh pr merge 0 --squash
  Expected: a gh error about PR 0 not existing (the command actually ran). If instead you get
  "agent_guard BLOCKED: agents never merge", the old guard is still loaded: open a fresh chat and
  re-run the setup paste in docs/agent-teams/TEAM-PROMPT.md. Do not continue.
  Then: git fetch origin; git status (must be clean, on main, up to date with origin/main; if not, STOP
  and tell Alex). mkdir RUNDIR. Note origin/main sha in your first message.
WAVE 0b  BASELINE
  Spawn "chief" (qa-chief). It records the baseline (tests, smoke) in RUNDIR\BOARD.md. Wait for its
  first worklog line.

WAVE 1  AUDIT  (alive: chief, qa, mp, sec = 4)
  Spawn "qa" (game-qa), "mp" (mp-qa), "sec" (security-auditor), each in its own worktree:
  git worktree add ..\fr-<name> origin/main  (detached, read-only roles do not need a branch).
  Each files tickets to chief. When qa finishes, spawn "balance" (balance-auditor) in its own worktree;
  it also owns the 5 red tests (DECISIONS-NEEDED.md 2026-11-08). Wait for all four last-lines. chief
  triages as tickets arrive. Shut down qa, mp, sec, balance when their last line is written.

WAVE 2  IDEAS  (alive: chief, ideas)
  Spawn "ideas" (ux-scout) after qa's worklog exists. It files I-NN tickets. chief approves at most 3
  as APPROVED-FIX. Shut down ideas.

WAVE 3  FIX  (alive: chief, gate, up to 2 fixers)
  Spawn "gate" (release-gate). For each APPROVED-FIX in board order, spawn "fixer-<id>" (fixer) with the
  ticket id, the function it names, and the test that proves it. chief told you which tickets touch the
  same function: those run one after another, never together. Each fixer opens a draft PR and hands to
  gate; gate PASS/FAIL; chief scope-checks; SHIPPED-PR or bounce. Three FAILs = FAILED. Shut each fixer
  down when its last line is written.
  chief merges every Merge: chief auto PR as it passes. Then STOP. Message Alex: the list of PRs by merge class (merged / held), the FAILED
  tickets, the APPROVED-REPORT items. Do not continue until Alex says "release" or "report".

WAVE 4  RELEASE  (on Alex's "release", after chief merged the auto batch)
  gate: git fetch origin; opens the single release PR per its role file (version bump, changelog mirror,
  zip builds). chief merges it. Pages goes live on merge; itch upload is Alex's.

WAVE 5  REPORT  (on "report", or right after wave 4)
  chief writes REPORT.md. Shut down chief and gate. Run:
  python HOOK digest <RUN>
  git worktree add ..\fr-records -b claude/agents-records-<RUN> origin/main
  python HOOK export <RUN> ..\fr-records\docs\agent-teams\runs\<RUN>
  Read every exported file: counts, ids, invented names only; no key values, no real people. Commit,
  push the branch, open a draft PR "docs: agent loop <RUN> records (no code)". Tell Alex: the PR link,
  the block count from the digest, and what the team could not test (2-device MP, itch page, Supabase).

RULES YOU ENFORCE AS LEAD
- You never edit index.html, game.test.js, tools/, docs/agent-teams rules, or any PR. You spawn, message,
  shut down, serialize, export.
- A teammate that claims "verified" without pasted output gets one message: paste it. Then chief decides.
- A BLOCKED line in anyone's output is read, not retried with different words. If a teammate rewords a
  blocked command, shut it down and note it for the report.
- chief merges Merge: chief auto PRs. Nothing else is pushed to main. Nothing calls Supabase, Tenor,
  itch or ipify from a script. $0.
- If anything here conflicts with OPERATING-RULES.md, that file wins.
```

## After the run

- `python %USERPROFILE%\.freedom-race\agent-hooks\agent_guard.py digest <run>` re-counts blocks and failures.
- Raw `events.jsonl` and `transcripts\` stay in `%USERPROFILE%\.freedom-race\agent-logs\`. Do not commit,
  attach or paste them anywhere public; the exported `*.md` are the shareable record.
- To change the benchmarks or the named human for a run, add one line at the end of the team prompt:
  `Benchmarks: A, B, C. Named human: <name>, <stake>, <moment>.`
