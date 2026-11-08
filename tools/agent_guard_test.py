"""tools/agent_guard_test.py - checks tools/agent_guard.py the way Claude Code runs it:
JSON on stdin, exit 2 = blocked, exit 0 = allowed. Temp log folder, no network, invented values only.

    python tools/agent_guard_test.py
"""
import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HOOK = os.path.join(HERE, 'agent_guard.py')
TMP = tempfile.mkdtemp(prefix='frguard_')
ENV = dict(os.environ, FR_AGENT_LOGS=TMP, FR_AGENT_RUN_ID='t-run')
ENV.pop('FR_AGENT_UNLOCK', None)
fails = []


def run(payload, env=None, raw=None):
    p = subprocess.run([sys.executable, HOOK], input=raw if raw is not None else json.dumps(payload),
                       capture_output=True, text=True, env=env or ENV, timeout=30)
    return p.returncode, p.stderr


def bash(cmd):
    return {'hook_event_name': 'PreToolUse', 'tool_name': 'Bash', 'tool_input': {'command': cmd}, 'session_id': 's1'}


def edit(path, old='a', new='b', tool='Edit'):
    return {'hook_event_name': 'PreToolUse', 'tool_name': tool,
            'tool_input': {'file_path': path, 'old_string': old, 'new_string': new, 'content': new}}


def expect(name, payload, code, env=None):
    got, err = run(payload, env)
    if got != code:
        fails.append('%s: expected exit %d, got %d (%s)' % (name, code, got, err.strip()))


# ---- commands that must be refused
for c in ['git push', 'git push origin main', 'git push origin HEAD:main', 'git push -f origin claude/x',
          'git push --force-with-lease origin claude/x', 'git push origin --delete claude/x',
          'gh pr merge 12', 'gh pr merge 12 --squash', 'git merge origin/main', 'git merge main',
          'git rebase -i HEAD~3', 'git checkout main', 'git switch master', 'git reset --hard HEAD~1',
          'git clean -fd', 'git branch -D main', 'rm -rf tools/out', 'Remove-Item node_modules -Recurse -Force',
          'butler push freedom-race.zip tradervert/freedom-race:html', 'npm publish', 'gh release create v1',
          'gh api -X PUT repos/o/r/pulls/1/merge', 'gh api repos/o/r/pages -X PATCH -f build_type=legacy',
          'gh repo edit --homepage x', 'gh pr close 12', 'gh secret set X',
          'curl -X POST https://example.supabase.co/rest/v1/cf_rooms', 'iwr https://tenor.googleapis.com/v2/search',
          'curl https://api.ipify.org', 'taskkill /im node.exe /f', 'pkill chrome']:
    expect('refuse: ' + c, bash(c), 2)

# ---- commands that must pass
for c in ['node game.test.js', 'npm test', 'node tools/smoke.cjs --offline', 'node build-zip.cjs', 'git status',
          'git log --oneline -5', 'git diff origin/main..HEAD --stat', 'git fetch origin', 'git rebase origin/main',
          'git push -u origin claude/fix-dice', 'git push origin claude/fix-dice',
          'git worktree add ../fr-fix -b claude/fix-dice origin/main', 'git checkout -b claude/x origin/main',
          'git checkout main -- README.md', 'git commit -m "fix: merge of main into dice logic; push to main later"',
          'gh pr create --title "x" --body "Merge: ready for Alex. See PUBLISH.md"', 'gh pr view 12', 'gh api repos/o/r/pulls/12',
          'npx playwright install chromium', 'grep -n GAME_VERSION index.html', 'python tools/agent_guard_test.py',
          'rm tools/out/desktop.png']:
    expect('allow: ' + c, bash(c), 0)

# ---- edits
for path in ['.github/workflows/pages.yml', '.claude/settings.local.json', 'tools/agent_guard.py', 'CNAME',
             'promo/cover.png', 'build-zip.cjs', 'PUBLISH.md', 'MONETIZE.md', 'docs/agent-teams/OPERATING-RULES.md',
             'docs/agent-teams/PROTOCOL.md', 'docs/agent-teams/TEAM-PROMPT.md', 'package-lock.json', '.gitignore']:
    expect('refuse edit: ' + path, edit(path), 2)
expect('refuse Write index.html', edit('index.html', tool='Write'), 2)
expect('refuse keys edit', edit('index.html', "const ROOMS_KEY='x';", "const ROOMS_KEY='y';"), 2)
expect('refuse endpoint edit', edit('index.html', 'a', "fetch('https://zzz.supabase.co/rest/v1/x')"), 2)
expect('refuse telemetry edit', edit('index.html', 'function logSession(ended){', 'function logSession(){return;'), 2)
expect('refuse huge edit', edit('index.html', 'a', 'x' * 13000), 2)
for path in ['index.html', 'game.test.js', 'tools/smoke.cjs', 'README.md', 'CHANGELOG.md', 'FEATURES.md',
             'docs/agent-teams/runs/2026-11-08-loop.md', 'tools/new_balance_sim.cjs']:
    expect('allow edit: ' + path, edit(path, 'function rollDice(){', 'function rollDice(){ // fixed'), 0)
expect('allow version bump', edit('index.html', "const GAME_VERSION='1.29.0';", "const GAME_VERSION='1.29.1';"), 0)
expect('allow Read anything', {'hook_event_name': 'PreToolUse', 'tool_name': 'Read',
                               'tool_input': {'file_path': 'tools/agent_guard.py'}}, 0)
unlock = dict(ENV, FR_AGENT_UNLOCK='keys,build-zip.cjs')
expect('unlock keys', edit('index.html', "const TENOR_KEY='a'", "const TENOR_KEY='b'"), 0, unlock)
expect('unlock file', edit('build-zip.cjs'), 0, unlock)
expect('unlock does not lift telemetry', edit('index.html', 'logSession(', 'x('), 2, unlock)

# ---- fail open
code, _ = run(None, raw='not json')
if code != 0:
    fails.append('malformed stdin must exit 0, got %d' % code)
code, _ = run({'hook_event_name': 'PreToolUse', 'tool_name': 'Bash', 'tool_input': 'weird'})
if code != 0:
    fails.append('non-dict tool_input must exit 0, got %d' % code)

# ---- recorder: scrubbed line per event, blocked attempts logged, transcript kept
tr = os.path.join(TMP, 'sess.jsonl')
with open(tr, 'w') as f:
    f.write('{"x":1}\n')
run({'hook_event_name': 'PostToolUse', 'tool_name': 'Bash', 'teammate_name': 'qa',
     'tool_input': {'command': 'echo player@example.com 305-555-0142 token=abcdef123456 AIzaSyA' + 'b' * 33},
     'tool_response': {'stdout': 'call (786) 555-0199 ' + 'eyJ' + 'Q' * 100}})
run({'hook_event_name': 'SubagentStop', 'teammate_name': 'qa', 'transcript_path': tr})
log = os.path.join(TMP, 't-run', 'events.jsonl')
lines = [json.loads(l) for l in open(log, encoding='utf-8')] if os.path.isfile(log) else []
text = open(log, encoding='utf-8').read() if lines else ''
if not lines:
    fails.append('no events.jsonl written')
for leak in ('player@example.com', '305-555-0142', '555-0199', 'abcdef123456', 'AIzaSyA', 'QQQQQQQQQQ'):
    if leak in text:
        fails.append('recorder leaked %s' % leak)
if not any(l.get('verdict') == 'BLOCKED' and 'main' in l.get('why', '') for l in lines):
    fails.append('blocked attempt not recorded')
if not any(l.get('who') == 'qa' for l in lines):
    fails.append('teammate name not recorded')
if not os.path.isfile(os.path.join(TMP, 't-run', 'transcripts', 'qa__sess.jsonl')):
    fails.append('transcript not copied on SubagentStop')
p = subprocess.run([sys.executable, HOOK, 'digest', 't-run'], capture_output=True, text=True, env=ENV, timeout=30)
if p.returncode != 0 or 'Blocked by the guard' not in p.stdout:
    fails.append('digest failed: %s' % (p.stdout[-300:] + p.stderr[-300:]))
with open(os.path.join(TMP, 't-run', 'BOARD.md'), 'w', encoding='utf-8') as f:
    f.write('F-qa-01 tester tester@example.com 954-555-0100 v1.29.0 turn 12\n')
dest = os.path.join(TMP, 'export')
p = subprocess.run([sys.executable, HOOK, 'export', 't-run', dest], capture_output=True, text=True, env=ENV, timeout=30)
out = open(os.path.join(dest, 'BOARD.md'), encoding='utf-8').read() if os.path.isfile(os.path.join(dest, 'BOARD.md')) else ''
if p.returncode != 0 or 'example.com' in out or '954-555-0100' in out or 'v1.29.0 turn 12' not in out:
    fails.append('export did not scrub, or ate the content: %r %s' % (out, p.stdout + p.stderr))
if os.path.exists(os.path.join(dest, 'events.jsonl')):
    fails.append('export copied raw events')

print('agent_guard checks: %d failure(s)' % len(fails))
for f in fails:
    print('FAIL', f)
sys.exit(1 if fails else 0)
