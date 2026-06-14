# Changelog — Freedom Race

All notable changes, newest first. Versioning: **patch** (1.0.x) = fixes/polish, **minor** (1.x.0) = new features/content, **major** (x.0.0) = big overhauls. The player-facing subset lives in the in-game `CHANGELOG` array (`index.html`), surfaced by the version badge → "What's New".

> On every release: bump `GAME_VERSION` in `index.html`, add an entry here + in the in-game `CHANGELOG`, then run the **Release Ritual** in `PUBLISH.md`.

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
