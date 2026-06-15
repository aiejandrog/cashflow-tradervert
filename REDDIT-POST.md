# Freedom Race — Reddit Launch Pack

Play link (lead with this — instant, no download): https://aiejandrog.github.io/cashflow-tradervert/

> Reddit rule #1: lead with value, not "check out my thing." Write like a person, not
> a press release. No em dashes, no "elevate/leverage/unleash," no emoji spam. A little
> rough and specific beats polished and generic.

---

## POST A — for r/WebGames, r/playmygame, r/incremental_games, r/SideProject
(game-first, casual)

**Title options (pick one):**
1. I made a free browser board game about escaping the rat race — play with friends, no download
2. Built a multiplayer "financial freedom" board game you can play in your browser (free, no signup)
3. My take on the Cashflow board game, but free, online, and playable with friends

**Body:**
```
I grew up wanting to play the Cashflow board game (the Rich Dad one) but it costs
like $200 and you need people in the same room. So I built my own version that runs
in the browser, free, no download, no signup.

You pick a career, a city, and a dream, then roll to build passive income and try to
escape the rat race before your expenses bury you. There are deals, market crashes,
lawsuits, kids, doodads that drain you, the whole thing.

Multiplayer works by just sharing a room name — your friend opens the same link on any
device and joins. No accounts.

Play here: https://aiejandrog.github.io/cashflow-tradervert/

It's a solo project and I'm still adding stuff, so I'd genuinely love feedback on:
- is the first turn confusing or clear?
- does multiplayer connect for you (and your friend)?
- what would make you actually come back and play it again?

Roast it, I can take it.
```

**First comment to drop yourself (the build story — this drives the thread):**
```
For anyone curious on the build: it's a single HTML file, vanilla JS, no framework.
Multiplayer is WebRTC (PeerJS) with a websocket relay fallback so it connects even
behind strict home routers. Board auto-scales to any screen. Hardest part was making
two strangers' browsers actually find each other reliably — took a few rounds.
```

---

## POST B — for r/ClaudeAI, r/OpenAI, r/artificial
(the AI-workflow angle — this is the one that pops right now)

**Title options:**
1. I shipped a full multiplayer browser game solo using Claude Code — here's the workflow that worked
2. Used Claude (and now Codex side by side) to build and ship a real multiplayer game. What each was better at.
3. Non-traditional dev here: built a live multiplayer game with AI coding tools. Lessons + the live demo.

**Body:**
```
I'm not a traditional engineer (I drive a truck), but I've been building real software
with AI coding tools and actually shipping it. Latest is a multiplayer browser board
game, live and playable: https://aiejandrog.github.io/cashflow-tradervert/

What actually worked for me:
- Let the AI PLAN before it codes. The biggest quality jump was making it write the
  plan first, then execute, instead of just "add feature X."
- Ship in small commits so when something breaks you can see exactly what did it.
- Verify in a real browser, not just "it should work." Most of my bugs only showed up
  when I actually loaded the page and clicked around.
- The killer move: have a SECOND model review the first one's code. Different model,
  different blind spots. It catches stuff the original missed.

I'm now running Claude Code and Codex side by side in two terminals on the same repo
(git as the handoff). Claude is stronger at holding the whole project in its head and
planning; Codex is a fast second opinion and good for contained chunks. Using both =
fewer bugs ship.

Happy to answer anything about the workflow. Demo's free, no signup, would love feedback.
```

---

## Target subreddits + their norms (READ THE SIDEBAR before posting)

| Subreddit | Best post | Norms / gotcha |
|---|---|---|
| r/WebGames | Post A | Must be free + playable in browser (you qualify). Direct link OK. |
| r/playmygame | Post A | Often wants a feedback ask + sometimes "play others' games too" reciprocity. |
| r/incremental_games | Post A | Has a weekly thread for smaller stuff — check pinned posts first. |
| r/SideProject | A or B | Loves the solo-builder story. Very promo-friendly. |
| r/ClaudeAI | Post B | Loves real build stories; hates low-effort "look what AI made." Be specific. |
| r/OpenAI / r/artificial | Post B | Same — the Claude+Codex side-by-side angle is the hook. |

**Don't:** blast all 6 in one hour from a fresh account. That's how you get shadowbanned.
**Do:** post to ONE today, see how it lands, space the rest over days, reply to every comment fast (early replies = the algorithm boosts the thread).

---

## Screenshot / clip shot list (grab these before posting — Reddit is visual)
1. The board mid-game with the player token + a deal card open (the "what is this" shot).
2. The character/career + dream pick screen (shows depth).
3. A 15-30s screen recording: roll, move, hit a payday, open a deal. Export as mp4/gif.
4. (For Post B) a shot of Claude + Codex split in two terminal panes on the same repo.

Put the clip/image as the post media; put the play link in the body AND the top comment
(some subs strip links from the body).

---

## Pre-post checklist (avoid removal / shadowban)
- [ ] Account has some comment history (not a day-old throwaway).
- [ ] Read the target sub's rules + check for a required flair.
- [ ] Title has NO "please upvote", no clickbait, no emoji.
- [ ] Lead with the game/story, link is secondary.
- [ ] Reply to the first 5-10 comments within the first hour.
- [ ] One sub at a time. Space them out.
