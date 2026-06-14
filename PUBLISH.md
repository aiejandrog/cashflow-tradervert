# 🚀 How to Publish Freedom Race

The whole game is **one file** (`index.html`) with no server and no build step.
That makes publishing easy. You have two good homes for it — do **both**.

---

## ✅ Option A — It's already live (GitHub Pages)

Your game is already on the internet right now:

**https://aiejandrog.github.io/cashflow-tradervert/**

Anyone with that link can play it in their browser — phone or desktop. To update it,
you just `git push` (you already do this) and it redeploys in ~40 seconds.

**Share this link anywhere today.** It costs nothing and there's nothing to set up.
Itch.io (below) is worth doing too because that's where players actually *discover* games.

---

## 🎮 Option B — Publish on itch.io (recommended for reach)

itch.io is the #1 place indie browser games get found and played. ~10 minutes.

### 1. Make the upload file (a .zip)
1. Open the folder `C:\Users\olqbb\projects\cashflow-game`
2. Select **only `index.html`** (NOT the .md files, NOT game.test.js)
3. Right-click → **Send to → Compressed (zipped) folder**
4. Name it `freedom-race.zip`
   - ⚠️ `index.html` must be at the **top level** of the zip (not inside a subfolder),
     or itch won't find it.

### 2. Create the itch.io page
1. Go to **itch.io** → sign up / log in (free)
2. Top-right menu → **Upload new project**
3. Fill in:
   - **Title:** `Freedom Race — Tradervert Edition`
   - **Project URL:** `freedom-race` (or whatever's free)
   - **Classification:** Game
   - **Kind of project:** **HTML** (this is the important one)
   - **Pricing:** **No payments** (free) — or "Name your own price" if you want tips

### 3. Upload + set it to play in the browser
1. Under **Uploads**, click **Upload files** → pick `freedom-race.zip`
2. Tick the checkbox that appears: **"This file will be played in the browser"**
3. **Embed options** (right below):
   - **Viewport dimensions:** Width `1280`, Height `800`
     *(the board scales by height — keep it tall, not short & wide)*
   - ✅ **Fullscreen button**
   - ✅ **Mobile friendly** → choose **"Automatically detect orientation"**
   - ✅ **Click to launch in fullscreen** (optional, feels premium)

### 4. Make the page look good (this is what gets clicks)
- **Cover image:** 630 × 500 px — a screenshot of the neon board or the logo
- **Screenshots:** add 3–5 (the board, a deal card, the win screen, the fast track)
- **Short description (one line):** e.g.
  *"A neon CASHFLOW + BitLife board game — escape the rat race, race a rival to your dream."*
- **Genre tags:** `board game`, `simulation`, `economic`, `singleplayer`, `multiplayer`, `idle`
- **Longer description:** what it is, that it's free, solo + pass-and-play multiplayer,
  build assets, beat your rival, hit your dream.

### 5. Publish
- Set **Visibility & access** → **Public**
- Click **Save & view page**, hit **Play**, confirm it loads.
- Done — share the itch.io link.

**To update later:** zip a fresh `index.html`, go to your project → **Edit game** →
delete the old upload, upload the new zip, re-tick "play in browser," **Save**.

---

## 📣 Where to share it (so people actually play)
- **Reddit:** r/incremental_games, r/WebGames, r/playmygame, r/IndieGaming
  (read each sub's self-promo rules first)
- **Instagram / TikTok:** a 15-sec screen-rec of a deal → win, link in bio
- **Friends/family first:** they're your best early testers and word-of-mouth
- Add the link to your bio everywhere

---

## ⚠️ Two things to know (not blockers)
1. **Online multiplayer** uses external services (PeerJS + Supabase via CDN). Solo and
   same-device pass-and-play work with no internet/service at all. Online play needs those
   services up — fine for launch.
2. **Saves** live in each player's browser (localStorage). Normal for web games; clearing
   site data wipes a save. Nothing you need to do.

---

## TL;DR
- **Today:** share **https://aiejandrog.github.io/cashflow-tradervert/** — it's live.
- **This week:** zip `index.html` → itch.io → "play in browser" → fullscreen + mobile →
  cover image + screenshots → Public. That's where players find it.

---

## 🔁 The Release Ritual (run this on EVERY update)

The game is **live** at https://freedomrace.itch.io/freedom-race. To ship an update and
reach everyone who's interested:

1. **Make the change**, then **bump the version**: edit `GAME_VERSION` in `index.html`
   (patch = fix, minor = feature, major = overhaul) and add an entry to the in-game
   `CHANGELOG` array **and** to `CHANGELOG.md`.
2. **Deploy the web build:** `git push origin main` → GitHub Pages updates in ~40s.
3. **Update itch:** rebuild the zip (a single `index.html` at the zip root), then on the
   itch project → **Edit game** → **Upload files** → replace the old HTML upload with the
   new zip → keep **"This file will be played in the browser"** ticked → Save.
4. **Post a Devlog** (project → **Devlog** → new post). 🔑 *This is the part that matters:*
   itch **automatically notifies every follower** of the new devlog — that's your free,
   zero-infrastructure broadcast to everyone who cares. Paste the changelog notes.
5. *(Optional)* Post a 15-sec clip (win / fast track) on IG/TikTok/Reddit with the link to
   pull NEW followers.

**Why followers matter:** the in-game "❤️ Follow" buttons (win screen + changelog) convert
players into followers, and devlogs let you reach all of them on every release — and later,
announce **paid** games to them. See `MONETIZE.md` for the full funnel.
