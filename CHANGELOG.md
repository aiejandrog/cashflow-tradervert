# Changelog — Freedom Race

All notable changes, newest first. Versioning: **patch** (1.0.x) = fixes/polish, **minor** (1.x.0) = new features/content, **major** (x.0.0) = big overhauls. The player-facing subset lives in the in-game `CHANGELOG` array (`index.html`), surfaced by the version badge → "What's New".

> On every release: bump `GAME_VERSION` in `index.html`, add an entry here + in the in-game `CHANGELOG`, then run the **Release Ritual** in `PUBLISH.md`.

## v1.17.0 — 2026-06-14 — Pets expansion: breeds, cats, Pet Shop, multi-pet inventory
- **12 new pets (user request, "get creative"):** chihuahua, kitten, rabbit, corgi, poodle, black cat, husky, pit bull, rottweiler, fox, tiger cub (+ existing goldfish/hamster/cat/parrot/dog/dragon) — 18 total. Each with icon/sound/treat/bonus/blurb in `PETS`.
- **Pet Shop:** `openPetAdopt`→`openPetShop` lists all buyable pets; owned ones show "Set Active", the current one shows "Active", unowned show the price.
- **Multi-pet INVENTORY:** new `G.pets[]` (inventory) alongside `G.pet` (active). `setActivePet(id)` swaps which pet is in the pet-cam and swaps the income bonus (only the active pet's bonus rides `salaryBoost` — verified no stacking). `adoptPet` adds to inventory + activates (owned re-adopt = free set-active). `openPetInventory()` ("🎒 My Pets") lists owned pets to swap. `_petsArr/_petOwned/_petSyncActive` helpers; rename (panel + modal) writes back to the inventory entry. Release removes the active pet from the collection and reverts to Scout. initGame seeds `pets:[stray]`; loadSave rebuilds `G.pets` from a single-pet save (back-compat verified) and guarantees Scout is present. Save/restore verified.

## v1.16.0 — 2026-06-14 — DJ Booth (YouTube jukebox) + LIFE FEED drag fix
- **DJ Booth (user request):** Shop perk `{id:'dj',cat:'Perks',type:'perk'}` (✦1500). When owned, the music menu (`_musMenuHTML`) shows "🎵 Play a Song (YouTube)" → `jukeboxPrompt()` parses the URL (`_ytParseId`: watch/youtu.be/shorts/embed/live/raw-id), lazy-loads the YouTube IFrame API (`_ytLoadAPI`), creates a hidden `#yt-jukebox` player (`_ytEnsurePlayer`), `loadVideoById`. In MP it `netSend({type:'music',action:'play'|'stop',vid,...})`; `_netRecv` `type==='music'` case plays/stops the same song for everyone + drops a feed line. Each player's 🔊 `toggleMute` mutes/resumes the jukebox locally; remote receivers get a one-time "🎵 Tap to hear the music" prompt (autoplay-policy fallback). `onError` toasts on non-embeddable videos. CAVEATS (accepted by user incl. copyright): embedding-disabled videos won't play, ads may precede, needs internet (external API), remote autoplay may need a tap.
- **LIFE FEED drag fix (user-reported):** `makeDraggable`'s move handler now CLAMPS position (`top≥56` below the top bar, within viewport) so `#chat-log` can't be dragged off-screen/unreachable. Added a `⤢` reset button + double-click-header → `resetChatPos()` clears inline left/top/right/bottom → back to CSS default. Verified clamp/reset, URL parsing, perk-gating, Shop render (0 errors).

## v1.15.1 — 2026-06-14 — Pet name plate + inline rename (user request)
- Removed the `#pet-live` "● LIVE" indicator (+ its `petLive` keyframe).
- Added `#pet-namebar` under the pet-cam: the pet's name in smooth **gold gradient** lettering (`-webkit-background-clip:text`), tappable to rename **inline** (`startRenamePet`/`commitRenamePet` swap a styled `#pet-name-inp`; Enter or blur commits, double-commit guarded). `_petDisplayName()` shows a custom name as-is or the preset's first word ("Scout"). New name stored on `G.pet.name` + `G.pet.named` flag (persists; old saves default to first-word display). Verified: LIVE gone, name shows, rename Scout→Rex persists.

## v1.15.0 — 2026-06-14 — Resign button, bankruptcy fix, MP Quick Match fix, rainbow loader
- **Resign (user request):** ⚙️ Settings "Abandon Run" relabeled to **🏳️ Resign Game (end this run)** — clear concede that ends the run and returns to the menu (✦/trophies safe).
- **Bankruptcy fix (user-reported):** a maxed-out, $0-cash, –$152k account limped forever. ROOT CAUSE: `checkBankruptcy` required `cf < -expenses*0.5` (e.g. CF needed to be worse than –$7.4k when expenses were $14.7k), so a –$4.7k CF never qualified. Rewrote the debt trigger to `loanRoom<=0 && cf<0 && cash<=0` (bank maxed, no borrowing room, bleeding, broke = unrecoverable). Verified it fires.
- **MP Quick Match fix (user-reported):** selecting 2-4 players then Quick Match dropped you into SOLO. `startQuickMatch` always called `startGame()` ignoring `_mpCount`. Now if `_mpCount>1` it sets `window._mpQuick`, randomizes the host's picks, and opens room setup; `mpConfirmRoomSetup` sees the flag and jumps straight to `mpAfterDreamGo()` (the lobby). Verified: 2 players → MP lobby, not solo. `mpCancelRoomSetup` clears the flag.
- **Rainbow loader:** boot screen `.boot-bar-fill` is now a moving 8-stop rainbow (`background-size:200%` + `bootRainbow` keyframe) alongside the fill animation.

## v1.14.1 — 2026-06-14 — Pet reaction fix (no more glitch)
- **Fixed (user-reported): the pet glitched/jittered when you pressed Pet.** Two causes: (1) `_petFaceAnim` called `element.animate()` without cancelling in-flight anims, so a Pet click colliding with the idle loop (or a fast 2nd click) stacked WAAPI animations → jump. Now it `getAnimations().forEach(cancel)` first (verified: exactly 1 animation at all times, even on rapid clicks). (2) `_petEyesClose` flashed two `#pet-lids` box-shadow bars over the face that didn't align with the eyes → read as a glitch; replaced with a clean scaleY blink. Also: Pet now plays ONE composite squash→stretch→tail-wag→settle (springy easing, `transform-origin:50% 78%`), scaled hearts, and varied reactions (sound / ♥ / 🐾 / *happy wiggle*); `window.__petBusy` makes the idle loop yield ~1.1s so it can't fight a fresh interaction.

## v1.14.0 — 2026-06-14 — Smooth FREEDOM RACE loading screen
- **NEW (user request):** a branded loading screen on startup. `#boot-screen` (first child of `<body>`, z-index 100000) shows the FREEDOM RACE wordmark (reused skyline SVG + gold gradient text) on the **exact splash gradient** (seamless reveal) with a drifting glow, entrance + shimmer, and a loading bar. Fades into the menu (or resumed game) via a JS IIFE: WAAPI fade-out after a 1700ms minimum, plus belt-and-suspenders `setTimeout` removals (1300ms post-fade + a 4000ms absolute safety net) so it can NEVER stay stuck covering the game. Tap-to-skip via `window._bootSkip`. Decoupled from the resume logic — sits on top and fades to reveal whatever boot decided. Verified: renders full-screen with gold wordmark + skyline at z100000; auto-removes → interactive splash (menu path) and the board (resume path); 0 errors. (Note: http-server caches index.html — cache-bust the preview URL when testing.)

## v1.13.2 — 2026-06-14 — Main Menu button on career reveal + cheaper re-spin
- **Main Menu button (user request):** the career reveal card (`#rev-card`, splash) now has a `← Main Menu` button alongside Change Path / CHOOSE. It calls the existing `resetToSpin()` → hides the reveal, shows the spin card (the splash main menu). It does NOT commit or change the life path, and does NOT clear the `cf_pending_spin` lock, so it isn't a free re-roll loophole (the paid Change Path stays the only re-spin).
- **Cheaper re-spin (user request):** `CHANGE_PROF_COST` 2000 → **500** ✦. The "Change Path" label + the not-enough-credits alert both read the constant, so they auto-update.

## v1.13.1 — 2026-06-14 — Toggle-to-close top-bar buttons
- **UX (user request):** the top-bar popup buttons now TOGGLE — click 🚗 Dealer / 🏡 Realty / 🍸 Leisure / 🎓 School / 🛍 Shop / ⚙️ Settings once to open, click the same button again to close. New `toggleModal(id,fn)` wrapper tracks `window._modalOpener` (set on open, cleared in `closeModal`); if the same button is clicked while its popup shows, it calls `closeModal()` instead of re-opening. Shop is special-cased (its own `#credits-shop` fullscreen overlay, not `#modal`) — toggling removes the overlay. Closing always routes through the existing `closeModal()`, so `_resumeFn` restore is intact (no stuck turns — verified mid-turn toggle + 5 rolls, 0 errors).

## v1.13.0 — 2026-06-14 — Interactive pet companion (pet-cam)
- **NEW: live pet-cam panel (user request)** docked bottom-left of the board (`#pet-panel`, inside `#game` so it auto-hides off-screen; responsive — hidden ≤1040px wide or ≤560px tall, where Pet/Feed live in the Leisure → Pet modal instead). Shows the pet as a big animated "head" in a framed ● LIVE window with a happiness bar + ✋ Pet / 🦴 Treat buttons.
- **Interactions:** `petPet()` (eyes close via `#pet-lids`, hearts float, face wags, species sound bubble, +2 happy, 420ms anti-spam cooldown) and `feedPet()` (treat emoji flies to the mouth + chomp, +14 happy, consumes a treat). All motion uses WAAPI so it survives prefers-reduced-motion; every helper no-ops when the panel is hidden or `document.hidden`.
- **Happiness meter + reward:** `G.petHappy` (0–100) rises little-by-little as you interact, decays −8 each payday, and pays a tiered **happy-pet bonus** at payday via `petMorale()` (≥85→+$110, ≥50→+$40, <50→$0) — added to cash + shown as a payday row. Treats (`G.petTreats`) refill to 3 each payday. Bonus is a payday cash tip (NOT folded into `income()`), so FS math stays clean.
- **Free starter pet:** everyone begins with **Scout the Stray Pup** (`adopt:0, bonus:0`) so the panel is alive from turn one; `adoptPet` now SWAPS (removes old bonus before adding new — no stacking), and "Release" reverts to Scout. PETS gained `sound`/`treat` fields + `_petMeta()` lookup.
- **Event reactions:** `petReact()` — celebrates on positive payday & win/dream-car (`spawnWinConfetti`), whimpers on setback landings (doodad/layoff/audit/lawsuit/crisis/divorce/disability/recession). Idle loop (`_petIdle`, document.hidden-guarded) does ambient bob/blink/speech.
- Back-compat: pre-pet saves heal to Scout + happy 60 + 3 treats on load.

## v1.12.0 — 2026-06-14 — Visible rival roll + freedom-bar fix
- **Rival visible roll (user request)**: `_rivalTurnToast` now tumbles the rival's die (8× face-cycle ~520ms) before landing on the rolled value + revealing their % to freedom, so you SEE the rival roll like watching a multiplayer opponent. The rival already only races the rat race (advanceRival early-returns on `_onFastTrack`/`_winning`) — verified the Fast-Track freeze still holds.
- **Freedom bar fix (user-reported)**: the Cashflow Day payday card built its Freedom gauge from Unicode block chars (`█`/`░`) → rendered as ugly dark-block + dots. Replaced with a real CSS bar (green gradient fill, % width) injected via the card's innerHTML row value. Verified: bar div renders, no block chars.

## v1.11.0 — 2026-06-14 — Invisible-title fix + name guesser to 117
- **BUG FIX (user-reported): invisible card band titles.** `openModal` band values `gold` (16 uses), `life` (12), `dream` (2) had no `.mbox-band.*` CSS variant → fell back to base `color:#fff` with no background → white title on the parchment card = invisible (affected power-up plays, School, Leisure, Pets, dream & name-quiz modals). Added `.mbox-band.gold` (gold gradient + DARK text #2a1500), `.mbox-band.life` (purple), `.mbox-band.dream` (purple-magenta), and a fallback `background:#555` on both `.mbox-band` and `.ecm-band` bases so no band can ever render invisible again. Verified computed contrast on gold/life/dream/gray.
- **Name guesser 78→117**: added The Boys, Walking Dead, Succession, The Bear, Ted Lasso, Arcane, Death Note, Jujutsu Kaisen, FMA, HxH, Chainsaw Man, Spy x Family, Fortnite, Among Us, Red Dead, Final Fantasy, Cyberpunk, Kirby, Pac-Man, Wolf of Wall Street, Pursuit of Happyness, Godfather, BTTF, Terminator, Avatar, Indiana Jones, The Weeknd, Billie Eilish, Ariana, Drake, MrBeast, The Rock, Keanu, Oprah, sigma/meme bundle, more sports. Verified 20 new matches + no false positives on common names (Michael/Sarah/Jesus/etc.).

## v1.10.1 — 2026-06-14 — Pet visibility + combined-systems bug hunt
- **Pet shown in Life Hub**: adopted pet's icon now appends to `lh-avatar` (one-line render change) so the companion is visible, not just buried in the Leisure menu.
- **Combined-systems bug hunt (clean, no fixes)**: stress-tested education(Master's) + pet + scenario(ratehike) + Quick Match all active on one run. Verified income/expense finite, `monthlyCF === income−expenses`, **`income.total === salary+interest+reCF+bizCF`** (pet morale folds into salary, breakdown stays consistent), rate-hike applied, save/restore preserves edu+pet+scenario across reload, zero console errors.

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
