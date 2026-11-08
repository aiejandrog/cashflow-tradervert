#!/usr/bin/env python3
"""tools/agent_guard.py - flight recorder + release guard for Claude Code agent teams on Freedom Race.

Installed by hand (never by an agent) as a Claude Code hook in the MAIN checkout's
`.claude/settings.local.json` (gitignored, one machine). See docs/agent-teams/TEAM-PROMPT.md, "Setup paste".
It lives in tools/ rather than .claude/hooks/ so a sibling repo's stricter guard does not refuse to edit it.

Why this repo needs one: `main` IS the live game. GitHub Pages serves the repo root, so any push to
main deploys to every player in about 40 seconds, and the whole game is one 16k-line file that several
agents may be editing at once. The guard makes "agents open PRs, Alex merges" mechanical instead of a
promise.

Per hook event (JSON on stdin):

  every event   append ONE scrubbed line to <FR_AGENT_LOGS>/<run>/events.jsonl
                (who, event, tool, shortened scrubbed input, shortened scrubbed result).
                Emails, phones, long base64 / JWTs, Google-style API keys and key=value secrets are masked.
  PreToolUse    refuse (exit 2, reason on stderr) anything that ships, merges or destroys:
                pushing to main/master, bare `git push`, force-push, `gh pr merge`, merging main,
                `gh api` writes, `gh release`, `butler push` (itch), `npm publish`, `git reset --hard`,
                `rm -rf`, killing processes, shell calls to Supabase / Tenor / itch / ipify, checking out
                main in a worktree; and editing report-only files (.github/, .claude/settings*, the guard
                itself, CNAME, promo/, build-zip.cjs, PUBLISH.md, MONETIZE.md, the team rules) or the keys /
                endpoints / telemetry block inside index.html, or overwriting index.html whole, or an
                index.html edit larger than FR_MAX_EDIT_CHARS (default 12000: big diffs collide).
  Stop /        copy the session transcript into <run>/transcripts/ so a bad run can be read after the
  SubagentStop  session is gone. Raw transcripts are NOT scrubbed; they never leave the log folder.

Run folder: FR_AGENT_RUN_ID if set, else today's date (UTC). Log root: FR_AGENT_LOGS, default
%USERPROFILE%/.freedom-race/agent-logs (outside the repo, outside OneDrive).

    python tools/agent_guard.py digest [RUN]        # counts per agent, blocked attempts, errors -> <run>/digest.md
    python tools/agent_guard.py export RUN DEST     # scrubbed copy of the run's *.md into DEST (not events/transcripts)

Design rules:
  * Fails OPEN on its own bugs (exit 0): a broken recorder must not wedge a team.
  * Exit 2 is the only blocking exit.
  * FR_AGENT_UNLOCK="keys,telemetry,build-zip.cjs" (comma list of basenames or the tokens `keys` /
    `telemetry`) lifts the matching edit block for a session Alex starts on purpose. Commands are never unlocked.
  * Standard library only. Never imports repo code.
"""
import datetime
import json
import os
import re
import shutil
import sys

MAX_STR = 600
MAX_RESULT = 400
MAX_EDIT = int(os.environ.get('FR_MAX_EDIT_CHARS') or 12000)

# ---------------------------------------------------------------- scrubbing
_EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
_PHONE = re.compile(r'(?<![\w])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?![\w])')
_BLOB = re.compile(r'[A-Za-z0-9+/_-]{80,}={0,2}')
_GKEY = re.compile(r'\bAIza[0-9A-Za-z_-]{30,}')
_SECRET = re.compile(r'(?i)\b(token|api[_-]?key|password|passwd|secret|authorization|bearer)\b(\s*[:=]\s*(?:token\s+|bearer\s+)?|\s+(?=[A-Za-z0-9_\-]{20,}))(\S+)')


def scrub(s):
    if not isinstance(s, str):
        s = json.dumps(s, ensure_ascii=False, default=str)
    s = _BLOB.sub('<blob>', s)
    s = _GKEY.sub('<key>', s)
    s = _SECRET.sub(lambda m: m.group(1) + m.group(2) + '<secret>', s)
    s = _EMAIL.sub('<email>', s)
    s = _PHONE.sub('<phone>', s)
    return s


def short(v, n=MAX_STR):
    s = scrub(v)
    return s if len(s) <= n else s[:n] + '...<+%d chars>' % (len(s) - n)


# ---------------------------------------------------------------- where logs go
def log_root():
    return os.environ.get('FR_AGENT_LOGS') or os.path.join(os.path.expanduser('~'), '.freedom-race', 'agent-logs')


def run_id():
    rid = os.environ.get('FR_AGENT_RUN_ID') or datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    return re.sub(r'[^A-Za-z0-9_.-]', '_', rid)[:60]


def run_dir(rid=None):
    d = os.path.join(log_root(), rid or run_id())
    os.makedirs(d, exist_ok=True)
    return d


def who(data):
    for k in ('teammate_name', 'agent_type', 'agent_id'):
        if data.get(k):
            return str(data[k])
    return 'main'


def record(data, verdict=None, reason=None):
    ev = {
        'ts': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'event': data.get('hook_event_name', '?'),
        'who': who(data),
        'session': str(data.get('session_id', ''))[:12],
    }
    if data.get('agent_id'):
        ev['agent_id'] = str(data['agent_id'])[:40]
    if data.get('tool_name'):
        ev['tool'] = data['tool_name']
    if 'tool_input' in data:
        ev['input'] = short(data['tool_input'])
    if 'tool_response' in data:
        ev['result'] = short(data['tool_response'], MAX_RESULT)
    for k in ('prompt', 'message', 'task_subject', 'reason'):
        if data.get(k):
            ev[k] = short(data[k])
    if verdict:
        ev['verdict'] = verdict
    if reason:
        ev['why'] = reason
    with open(os.path.join(run_dir(), 'events.jsonl'), 'a', encoding='utf-8') as f:
        f.write(json.dumps(ev, ensure_ascii=False) + '\n')


def keep_transcripts(data):
    dest = os.path.join(run_dir(), 'transcripts')
    os.makedirs(dest, exist_ok=True)
    for k in ('transcript_path', 'agent_transcript_path'):
        p = data.get(k)
        if p and os.path.isfile(p):
            name = re.sub(r'[^A-Za-z0-9_.-]', '_', who(data)) + '__' + os.path.basename(p)
            shutil.copy2(p, os.path.join(dest, name))


# ---------------------------------------------------------------- the guard: commands
_MERGE = re.compile(r'(?i)\b(gh\s+pr\s+merge|git\s+merge\b[^;&|]*\b(?:origin/)?(?:main|master)\b|'
                    r'git\s+rebase\b[^;&|]*\s(?:-i|--interactive)\b)')
_SHIP = re.compile(r'(?i)\b(butler\s+push|npm\s+publish|gh\s+release\b|gh\s+api\b[^;&|]*\s(?:-X|--method)\s+(?:PUT|POST|PATCH|DELETE)\b|'
                   r'gh\s+api\b[^;&|]*\s(?:-F|-f|--field|--raw-field)\b|gh\s+repo\s+(?:edit|delete|rename|archive)\b|gh\s+pr\s+(?:close|ready)\b|'
                   r'gh\s+secret\b|gh\s+variable\s+set\b|supabase\s+(?:db|functions|secrets|projects)\b)')
_DESTROY = re.compile(r'(?i)(\brm\s+(?:-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)[a-z]*\b|\brd\s+/s\b|\brmdir\s+/s\b|remove-item\b[^;&|]*-recurse\b|'
                      r'\bgit\s+reset\s+--hard\b|\bgit\s+clean\s+-[a-z]*f|\bgit\s+branch\s+-D\s+(?:main|master)\b|\bgit\s+push\b[^;&|]*--delete\b|'
                      r'\bgit\s+(?:checkout|switch)\s+(?:main|master)\b(?!\s+--)|\bgit\s+worktree\s+remove\b[^;&|]*--force\b)')
_KILL = re.compile(r'(?i)\b(taskkill|stop-process|kill\s+-9|pkill|killall)\b')
_VENDOR = re.compile(r'(?i)(supabase\.co|tenor\.googleapis|itch\.io|ipify|peerjs\.com)')
_NET = re.compile(r'(?i)\b(curl|wget|invoke-webrequest|iwr|invoke-restmethod|irm|fetch\(|requests\.|urllib|httpx)\b')
_MSG = re.compile(r'(?s)(\s-m\s+|\s--body\s+|\s--title\s+|\s-b\s+|\s-t\s+)("(?:[^"\\]|\\.)*"|\'[^\']*\')')


def _git_push_problem(cmd):
    for m in re.finditer(r'(?i)\bgit\s+push\b([^;&|\n]*)', cmd):
        args = m.group(1)
        if re.search(r'(?i)(--force\b|--force-with-lease|\s-f\b|\s\+\S)', ' ' + args):
            return 'force-push is never allowed'
        if re.search(r'(?i)(?:^|\s|:)(main|master)\b', args):
            return 'pushing to main deploys the live game to every player; push your claude/* branch and open a PR'
        if 'claude/' not in args:
            return 'name the branch: git push -u origin claude/<name> (a bare push could hit main, which is live)'
    return None


def check_command(cmd):
    """Return a refusal reason for a shell command, or None."""
    if not cmd:
        return None
    cmd = _MSG.sub(r'\1""', cmd)          # a commit message or PR body may mention main or a key; it runs nothing
    why = _git_push_problem(cmd)
    if why:
        return why
    if _MERGE.search(cmd):
        return 'agents never merge or rewrite history; gate writes "ready for Alex" and Alex merges'
    if _SHIP.search(cmd):
        return 'publishing (itch, npm, GitHub releases, gh api writes, repo settings) is Alex only'
    if _DESTROY.search(cmd):
        return 'destructive git / filesystem command; work in your own worktree and branch, delete nothing'
    if _KILL.search(cmd):
        return 'never kill processes you did not start (other agents\' browsers and servers run there)'
    if _VENDOR.search(cmd) and _NET.search(cmd):
        return 'no shell calls to Supabase, Tenor, itch, ipify or PeerJS; the game page may, scripts may not'
    return None


# ---------------------------------------------------------------- the guard: edits
BLOCK_BASENAMES = {'cname', 'build-zip.cjs', 'publish.md', 'monetize.md', 'operating-rules.md', 'protocol.md',
                   'team-prompt.md', 'package-lock.json', '.gitignore', 'agent_guard.py'}
BLOCK_TAILS = ('.github/', '.claude/settings', '.claude/hooks/', 'promo/')
_KEYS = re.compile(r'(ROOMS_KEY|TENOR_KEY|PROFILES_URL|SESSIONS_URL|ROOMS_URL|supabase\.co|tenor\.googleapis|createClient\()')
_TELEMETRY = re.compile(r'(_ipHash|logSession|cf_sessions|api\.ipify|_sessionStart|_deviceId)')


def _unlocked():
    raw = os.environ.get('FR_AGENT_UNLOCK', '')
    return {x.strip().lower() for x in raw.split(',') if x.strip()}


def _edit_blob(tool_input):
    blob = '%s\n%s' % (tool_input.get('old_string', ''), tool_input.get('new_string', ''))
    for e in tool_input.get('edits', []) or []:
        blob += '\n%s\n%s' % (e.get('old_string', ''), e.get('new_string', ''))
    return blob


def check_path(tool, path, tool_input):
    if not path:
        return None
    p = path.replace('\\', '/').lower()
    base = p.rsplit('/', 1)[-1]
    if tool == 'Read':
        return None
    unlocked = _unlocked()
    if base in unlocked:
        return None
    if base in BLOCK_BASENAMES:
        return '%s is report-only for agents (release tooling, business docs, the team rules or the guard); write a ticket instead' % base
    for t in BLOCK_TAILS:
        if t in p:
            return '%s is CI, machine setup, brand assets or hook wiring; agents never edit it' % t
    if base == 'index.html':
        if tool == 'Write':
            return 'never overwrite index.html whole (16k lines, several agents); Edit the one range your ticket owns'
        blob = _edit_blob(tool_input)
        if 'keys' not in unlocked and _KEYS.search(blob):
            return 'that edit touches the Supabase / Tenor keys or endpoints; security decisions are Alex only (FR_AGENT_UNLOCK=keys)'
        if 'telemetry' not in unlocked and _TELEMETRY.search(blob):
            return 'that edit touches session telemetry / IP hashing; privacy decisions are Alex only (FR_AGENT_UNLOCK=telemetry)'
        if len(tool_input.get('old_string', '')) > MAX_EDIT or len(tool_input.get('new_string', '')) > MAX_EDIT:
            return 'index.html edit over %d chars; split it, one function or block per Edit (big diffs collide with other agents)' % MAX_EDIT
    return None


def check(data):
    tool = data.get('tool_name') or ''
    ti = data.get('tool_input') or {}
    if not isinstance(ti, dict):
        return None
    if tool in ('Bash', 'PowerShell') or ('command' in ti and tool not in ('Edit', 'Write', 'Read')):
        return check_command(ti.get('command') or '')
    if tool in ('Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Read'):
        return check_path(tool, ti.get('file_path') or ti.get('notebook_path') or '', ti)
    return None


# ---------------------------------------------------------------- digest / export
def digest(rid):
    d = os.path.join(log_root(), rid)
    path = os.path.join(d, 'events.jsonl')
    if not os.path.isfile(path):
        print('no events for run %s (%s)' % (rid, path))
        return 1
    per, blocked, errors = {}, [], []
    with open(path, encoding='utf-8') as f:
        for line in f:
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            per[ev.get('who', '?')] = per.get(ev.get('who', '?'), 0) + 1
            if ev.get('verdict') == 'BLOCKED':
                blocked.append(ev)
            res = ev.get('result', '')
            if re.search(r'(?i)(traceback|error|exit code [1-9]|FAIL\b|refused)', res):
                errors.append(ev)
    out = ['# Agent run %s: digest (scrubbed, counts and commands only)' % rid, '',
           '| agent | events |', '|---|---|']
    out += ['| %s | %d |' % (k, v) for k, v in sorted(per.items())]
    out += ['', '## Blocked by the guard (%d)' % len(blocked)]
    out += ['- %s %s %s: %s' % (e['ts'], e['who'], e.get('tool', ''), e.get('why', '')) for e in blocked]
    out += ['', '## Tool results that look like failures (%d, first 60)' % len(errors)]
    out += ['- %s %s %s: %s' % (e['ts'], e['who'], e.get('tool', ''), e.get('input', '')[:160]) for e in errors[:60]]
    text = '\n'.join(out) + '\n'
    with open(os.path.join(d, 'digest.md'), 'w', encoding='utf-8') as f:
        f.write(text)
    print(text)
    return 0


def export(rid, dest):
    src = os.path.join(log_root(), rid)
    if not os.path.isdir(src):
        print('no run folder %s' % src)
        return 1
    os.makedirs(dest, exist_ok=True)
    n = masked = 0
    for name in sorted(os.listdir(src)):
        if not name.lower().endswith('.md'):
            continue
        with open(os.path.join(src, name), encoding='utf-8', errors='replace') as f:
            raw = f.read()
        clean = scrub(raw)
        masked += int(clean != raw)
        with open(os.path.join(dest, name), 'w', encoding='utf-8') as f:
            f.write(clean)
        n += 1
    print('exported %d file(s) to %s; %d needed masking (read those before you commit)' % (n, dest, masked))
    return 0


def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'digest':
        return digest(sys.argv[2] if len(sys.argv) > 2 else run_id())
    if len(sys.argv) > 3 and sys.argv[1] == 'export':
        return export(sys.argv[2], sys.argv[3])
    try:
        data = json.load(sys.stdin)
        if not isinstance(data, dict):
            return 0
    except Exception:
        return 0
    event = data.get('hook_event_name', '')
    reason = None
    try:
        if event == 'PreToolUse':
            reason = check(data)
    except Exception:
        reason = None                     # guard bug: fail open
    try:
        if event == 'PreToolUse':
            if reason:
                record(data, 'BLOCKED', reason)
        else:
            record(data)
        if event in ('Stop', 'SubagentStop', 'SessionEnd'):
            keep_transcripts(data)
    except Exception:
        pass
    if reason:
        sys.stderr.write('agent_guard BLOCKED: %s\n' % reason)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
