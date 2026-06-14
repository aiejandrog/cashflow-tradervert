# Changelog — Freedom Race

All notable changes, newest first. Versioning: **patch** (1.0.x) = fixes/polish, **minor** (1.x.0) = new features/content, **major** (x.0.0) = big overhauls. The player-facing subset lives in the in-game `CHANGELOG` array (`index.html`), surfaced by the version badge → "What's New".

> On every release: bump `GAME_VERSION` in `index.html`, add an entry here + in the in-game `CHANGELOG`, then run the **Release Ritual** in `PUBLISH.md`.

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
