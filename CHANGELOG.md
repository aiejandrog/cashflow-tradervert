# Changelog — Freedom Race

All notable changes, newest first. Versioning: **patch** (1.0.x) = fixes/polish, **minor** (1.x.0) = new features/content, **major** (x.0.0) = big overhauls. The player-facing subset lives in the in-game `CHANGELOG` array (`index.html`), surfaced by the version badge → "What's New".

> On every release: bump `GAME_VERSION` in `index.html`, add an entry here + in the in-game `CHANGELOG`, then run the **Release Ritual** in `PUBLISH.md`.

## v1.10.0 — 2026-06-14 — Pets
- **Adopt a pet** (🍸 Leisure → 🐾): `PETS` (6: goldfish/hamster/cat/parrot/dog + a $50k dragon). `openPets()`/`adoptPet()` deduct a one-time adoption cost and add a permanent morale boost folded into `G.salaryBoost` (so it shows in the income breakdown — no income()/expenses() edits, stays consistent like the hustler/raise perks). Give-up subtracts the boost (no refund). `G.pet` persists with the save. Affordability gating verified (cheap pets enabled, pricey ones 🔒 when broke); adopt/give-up round-trips salaryBoost cleanly.

## v1.9.0 — 2026-06-14 — 5 new run scenarios
- **SCENARIOS 6→11**: added Inheritance (🎁 onStart cash windfall), Tech Boom (💻 +50% cash-flow waves every 8 turns), Rate Hike Era (📈 `_rateHikeExtra` creep every 5), Pandemic Shock (🦠 sched turn 18, cash flow halved 5 turns), Side-Hustle Surge (💪 small cash drop every 4). All reuse proven economy fields (`_boomMult`/`_recLiteMult`/`_rateHikeExtra`/`G.cash`) consumed by income()/expenses() — no new engine wiring. Verified: each fires onStart/recurring/sched correctly, values finite, zero errors.

## v1.8.0 — 2026-06-14 — One-tap chat phrases
- **Quick-phrase banter** (`💬` button in chat → `#cl-phrase-picker`, 14 chips, `sendPhrase(txt)`): one tap sends canned lines (GG!, Nice deal, Coming for it, Rent's due, Skill issue, Cope, etc.) — instant MP banter, no typing. Reuses the chat send path (renders locally + `netSend({type:'chat'})`). `togglePhrasePicker()` and `toggleGifPicker()` close each other (no stacking); added to the `.cl-collapsed` hide rule.
- **Bug caught + fixed pre-ship**: two phrases with apostrophes used `&apos;` which decodes to a literal `'` inside the single-quoted JS string → broke the onclick (silent click failure). Switched to `\'` (survives HTML attr decode → JS escaped quote). Verified both post correctly.

## v1.7.0 — 2026-06-14 — 6 new rivals
- **RIVALS 4→10**: added Landlord Lara (24t), Index-Fund Ivy (32t), Flipper Hank (20t), FIRE Fiona (16t, fast/hard), Dividend Dave (34t, slow/easy), Algo Andy (19t, nod to KlausMNQ). Each with archetype blurb + 4 taunts; `escTurns` spread 16–34 for pace variety. Pure data addition to `RIVALS` — the pick grid (`rivalCardHTML` over `RIVALS`) and `_makeRival(id)` handle them automatically. Verified all 10 makeable (finite pace, taunts present), pick grid renders 13 cards (10 + Ghost + Solo + Surprise). (Zen/No-Rival already existed as the Solo card.)

## v1.6.0 — 2026-06-14 — Quick Match + bug-hunt pass
- **Quick Match** (`startQuickMatch()`, 🎲 button beside Spin): one tap → fully random life (random career via `_spinCareerLottery`, random `PRESET_CHARS` identity, random location + dream) → straight into the game. Placed in the spin button's flex row so it adds no splash height; verified splash still fits at 768.
- **Bug-hunt pass** (no fixes needed — all clean): 38-profession invariant sweep, ~7-turn live playthrough, forced WIN detection (`checkWin` enters Fast Track), forced bankruptcy (`triggerBankruptcy` overlay) — income/CF math consistent, cash finite throughout, **zero console errors** across all of it.

## v1.5.0 — 2026-06-14 — Chat reactions + meme categories
- **Quick-reaction bar** (`#cl-react-row`) in the always-present chat/Life-Feed panel: 10 emojis (😂🔥💀👏😮💰😭🎉❤️🤡) calling the existing `sendReaction()` → big animated floating emoji + MP broadcast (`type:'react'`, receive handler already present). The reaction system existed but its only UI was the spectator-wait box; now it's reachable during your own turn and in solo.
- **One-tap meme categories** (`#cl-meme-chips`, `memeSearch(term)`) in the GIF picker: LOL/Money/Win/Cry/Dance/Shook/Broke/Rich → instant themed Tenor search, no typing.
- Verified: 10 react buttons + 8 chips render, sendReaction floats a reaction, memeSearch opens picker + sets query. (MP fan-out uses the pre-existing netSend/receive path — unchanged.)

## v1.4.0 — 2026-06-14 — Quick Pick characters
- **Preset characters**: a "⚡ Quick Pick" row at the top of the create screen with 10 ready-made, diverse characters (`PRESET_CHARS`, built from `CHAR_STYLES`/`CHAR_TONES`). Tapping one fills `selectedIdentity` fully and reuses the real `btn-char-go` proceed path (works solo + MP), skipping the manual creator and the name-guess quip → straight to the city screen. The manual builder is unchanged below ("…or build your own").
- Verified: 10 cards render with correct avatars/names/ages; applyPreset sets identity + advances to location; identity flows into a started game (G.identity correct).

## v1.3.0 — 2026-06-14 — Name guesser overhaul
- **Pop-culture name radar** `_FAMOUS_NAMES` expanded 37→78 entries: added TV (Stranger Things, Mandalorian, Squid Game, Wednesday, TLOU, Sopranos, Peaky Blinders, Better Call Saul, Money Heist, Friends, Seinfeld, South Park, Family Guy), anime (Avatar, One Piece, AoT, Demon Slayer, MHA), games (Minecraft, Zelda, Sonic, GTA, Halo, GoW), movies (Matrix, Titanic, Pixar, Disney, DC, Marvel, Despicable Me, Barbie, Oppenheimer), music (BTS, Taylor Swift, Bad Bunny, hip-hop), memes & history. Anchored regexes to avoid false hits on real names.
- **Origin guesser** `_guessNameOrigin` rewritten: exact first-name lookup (`_NAME_ORIGINS`/`_NAME_FIRST`, 16 regions, ~400 names) + anchored surname-pattern fallbacks (`_NAME_PATTERNS`). Fixes the loose-substring bugs (Charlie→China via "li", Mason/Jason→Scandinavia via "son"). Verified across 16 region samples + false-positive regression set.
- Logic invariant sweep (38 professions): income.total === parts, monthlyCF === income−expenses, all finite/non-negative, education salary monotonic — all clean.

## v1.2.2 — 2026-06-14 — UI polish pass
Objective consistency/readability/feedback fixes from a full-file UI audit (no speculative redesigns):
- **Press feedback**: added `.btn-og:active{transform:translateY(1px)}` — every button variant now depresses on tap (they had hover but no active state). Base `.btn-og` radius 6px→8px.
- **Top-bar chips**: unified the freedom chip's corner radius (14px→18px) to match the other three status chips; added hover feedback to the clickable credit chip (was interactive with no hover).
- **Readability**: debt `.fs-pay-btn` was an ~8px button with 1px padding → 0.6rem / 3px 9px (legible + tappable, +hover/active); event-card number labels `.ec-num .nl` 0.58→0.62rem; credit-tier label 0.5→0.56rem.
- Left alone (subjective/needs-pixels): splash row color palette, modal width unification, top-bar button finish — flagged but not changed blind.

## v1.2.1 — 2026-06-14 — Splash fit fix
- Fixed the splash/main menu overflowing on short viewports (laptops ~768–860px tall): the bottom stats strip (`#profile-strip`) was clipped below the fold. Added `@media (max-height:860px)` + `(max-height:680px)` blocks that tighten splash gap/padding, logo size, and card spacing (~100px reclaimed). `.sp-item` height left at 68px so the spin reel (`ITEM_H=68`) stays aligned.

## v1.2.0 — 2026-06-14 — 🎓 Education / School system
- **New School & Career Path** (🎓 top-bar button → `openEducation()`): study to raise your salary and unlock higher-paying careers.
- **3 education levels** above High School — Trade/Associate (+8%), Bachelor's (+18%), Master's/Doctorate (+32%). Each level's `pct` is a permanent salary multiplier in `income()`; tuition paid in cash.
- **Career Change machine is now education-gated**: `_spinCareerLottery(maxEdu)` only lands on jobs whose `PROF_EDU_REQ` ≤ your level (Doctor/Lawyer/Quant/Hedge Fund need a Master's; trades need Associate; etc.). The initial life-spin and paid ✦ re-roll keep the full pool.
- `G.edu` persists with the save (JSON); old saves default to High School.

## v1.1.0 — 2026-06-14 — Main-menu Settings + tutorial/trophy polish
- **Settings panel on the main menu** (⚙️ button): toggle sound, pick from 6 soundtracks (or off), toggle reduced motion, plus How to Play / What's New / Follow / Support — all without starting a run.
- **Reduced Motion** is a real toggle now (class-gated mirror of the `prefers-reduced-motion` rules; persists in localStorage, applied on load).
- **Tutorial fix**: step cards dock clear of the element they highlight instead of covering it; step 2 now points at the ROLL button; copy + step count corrected (4 steps, "Freedom Race").
- **Trophy Wall**: added the missing base `.tw-card` style — trophy cards now render with proper layout, padding, and tier borders.

## v1.0.0 — 2026-06-14 — Launch 🎉
- Escape the rat race, race a **live rival**, and buy your **dream** on the Fast Track.
- Fast Track with **4 corner dream tiles** + smooth board movement.
- **Loans & expenses pay down every payday** — whether you pass or land on it.
- **Garage**: tap your vehicle in the Life Hub to view & sell rides (handles no-car / starter rides / financed cars).
- **Buy multiple rental properties** from the Realty office.
- Synth soundtrack + juicy SFX (master limiter), **38 careers**, difficulty & playstyle builds, starting transportation, credit specialist.
- Solo, same-device pass-and-play, and online multiplayer (with player skip-vote).
- Version badge + in-game "What's New" changelog.
