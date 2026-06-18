# Changelog — Freedom Race

All notable changes, newest first. Versioning: **patch** (1.0.x) = fixes/polish, **minor** (1.x.0) = new features/content, **major** (x.0.0) = big overhauls. The player-facing subset lives in the in-game `CHANGELOG` array (`index.html`), surfaced by the version badge → "What's New".

> On every release: bump `GAME_VERSION` in `index.html`, add an entry here + in the in-game `CHANGELOG`, then run the **Release Ritual** in `PUBLISH.md`.

## v1.29.0 — 2026-06-18 — Custom borrow amount + Fast Track upgrades
- **Bank Loan — custom amount:** `openBorrow` now has a custom `$` input (adaptive bounds so min never exceeds max near the $75k cap) alongside the $1k/$5k/$10k presets; `borrow()` floors to whole dollars. The modal spells out the recurring monthly payment (auto-deducted every Cashflow Day, auto-pays-down) — the mechanic always existed (`expenses().bankPmt`), it just wasn't surfaced.
- **Fast Track — buy your dream from any tile:** extracted the dream-purchase/WIN into a shared `ftBuyDream()` (single source of truth for the fragile cross-device win routing); a new "⭐ Buy Dream — WIN!" button in the FT turn dialog (`ftBuyDreamPrompt`) lets you claim the dream the moment you can afford it, not only by landing exactly on a ⭐ corner. Corner landing still auto-prompts.
- **Fast Track — live dream tracker:** `showTurnDialog` shows "$X to go (Y%)" + a "⭐ Y% to dream" chip every FT turn (FT-scoped — never leaks onto the inner board).
- **Fast Track — every tile does something:** `ftNeutralTile()` gives neutral tiles a small victory-lap micro-event (side gig / interest / referral / +credit / rare splurge), cash clamped at $0.
- **MP fixes (caught in adversarial review):** the new Buy-Dream button is gated by `_mpNotMyTurn()` (not the no-op `_mpLocked()`) so a waiting opponent can't win out of turn; `bcShowWaiting` tears down any stale turn dialog; removed a host double-advance (`ftBuyDream` no longer pairs `setTimeout(mpAdvanceTurn)` with `checkOuterWin`'s Continue button) that skipped a player.
- Verified: solo + simulated-MP logic tests via `preview_eval`, 0 console errors. **Online MP fast-track still wants a real 2-device playtest** per standing rule.

## v1.26.0 — 2026-06-15 — Revert to emoji icons + bigger shop (user request)
- **Reverted the drawn-icon system** (v1.24 OpenMoji + v1.25 game-icons). Game renders native system emoji again, as originally. The icon IIFE is disabled (early `return`) and the twemoji CDN `<script>` removed. The dice roll animation/logic was never touched — the icon system's global styles were making it look off; the revert restores the original visuals.
- **Shop +20 items, every category:** Board Themes 8→13 (Noir/Forest/Sunset/Rose Gold/Sakura), Dice Skins 12→17 (Bronze/Jade/Candy/Obsidian/Aqua), Premium Avatars 16→24 (Fox/Wolf/Sage/Lion/Kraken/Outlaw/Sprite/Phoenix), Power-Up Plays 6→8.
- **2 new Power-Up Plays** (with logic): 💵 Side Hustle (`sidehustle` → instant +$2,500) and 💳 Credit Repair (`credit` → `boostCredit(25)`). Wired into PLAYS, `_applyPlay`, and SHOP_ITEMS.
- Verified: 62 shop items, 0 dup ids, both new plays apply correctly (cash +2500, credit +25), dice roll runs clean, 0 syntax errors.

## v1.25.1 — 2026-06-15 — Count Fast Track / outer-board rolls as turns (bugfix)
- `G.turn` only incremented on inner-board landings, so escaping early then buying on the Fast Track showed an impossible "1 turn / 15 assets" win. Now `ftLand`/`obLand` increment turns too.

## v1.25.0 — 2026-06-15 — Drawn icon system (away from emoji) — game-icons.net
- **Concept icons** (45 careers, money, real estate, deals, dreams, UI) now render as hand-drawn **game-icons.net** vectors instead of emoji. ~55 emoji→icon mappings, all names verified to exist.
- **Tinting:** CSS `mask` + `currentColor` so each icon inherits its context's text colour — works on the dark board AND the light financial panel (a baked colour would vanish on one or the other). No per-icon colour decisions.
- **Layering:** a small text-scanner swaps mapped concepts → `.gi` spans; everything else still falls through to OpenMoji (v1.24), then system emoji. Reactions/flavour stay illustrated. Never a broken glyph.
- **Robust:** runs inside the existing MutationObserver (setTimeout flush) so dynamically-built DOM converts too; FE0F variation selectors normalised so `✈️`/`⚖️` etc. map correctly.
- Verified: 839 icons converted on the menu, 0 mapped concepts left as raw emoji, all spans have valid mask URLs (no solid-square risk), light-panel icons render via currentColor.
- **Next:** drawn DiceBear (Notionists) avatars to replace the emoji "people".

## v1.24.0 — 2026-06-15 — OpenMoji illustrated icon set (visual identity)
- Replaced platform-default emoji with **OpenMoji** (hand-drawn, CC-BY) across the whole UI so it reads as *designed*, not generic — the #1 lever against the "AI slop / looks default" perception, with no artist budget.
- **Engine:** Twemoji parser (bulletproof emoji detection); **assets:** OpenMoji. OpenMoji's uppercase, FE0F-stripped filenames match the parser's codepoints 1:1 (verified: `1F454`, `1F9D1-1F3FD`, `2764` all 200; `2764-FE0F` 404 → not used). Near-100% coverage incl. skin tones.
- **Robust:** `MutationObserver` re-renders dynamically-built DOM (modals, board, preset avatars). Fail-set guard + capture-phase error handler → any missing glyph silently falls back to the original system emoji (never a broken image), and never loops.
- **Bug fixed during verification:** flush was scheduled via `requestAnimationFrame`, which pauses in backgrounded tabs → dynamic content (e.g. preset avatars) wasn't converting. Switched to `setTimeout` so it fires regardless of tab visibility.
- Injected as one self-contained block before `</body>` — fully reversible. Verified: 419 emoji imgs converted on the character screen, 0 broken, 0 console errors.

## v1.23.1 — 2026-06-15 — Property manager popup shows mortgage + net cash flow (bugfix)
- The manage-property popup showed gross rent and the manager fee but **not the mortgage payment**, so the numbers didn't reconcile to the asset's actual cash flow (e.g. $7,550 − $600 looked like $6,950 but CF was $2,933). Added a 🏦 Mortgage line and a 💰 Net cash flow line. Underlying math was always correct — display was incomplete.

## v1.23.0 — 2026-06-15 — Preset character personas (UX, user request) + bug-hunt pass
- **PRESET_CHARS 10→14:** added Trang (Vietnam), Emre (Turkey), Kai (Pacific Islander), João (Brazil) — showcasing the v1.22 name-guesser regions.
- **Persona taglines:** every preset now shows a vibe (The Hustler/Planner/Visionary/Veteran/Strategist/Late Bloomer/Grinder/Prodigy/Dreamer/Wildcard/Striver/Closer/Free Spirit/Optimist), rendered under the name in the quick-start row.
- **Bug-hunt pass (no fixes needed):** validated data integrity across 45 careers + 28 dreams (0 issues), new-career game start (no NaN, paydays compute), education gating (statistically airtight: gated careers never leak at low edu, appear at required edu), win/dream-cost logic. Game logically sound after recent content adds.
- Verified: 0 syntax errors; 14 presets render with taglines + valid avatars/indices; new names resolve (Trang→Vietnam, Emre→Turkey, Kai→Pacific); applyPreset sets identity & proceeds with 0 errors.

## v1.22.0 — 2026-06-15 — Name-guesser expansion (content + bug fix, user request)
- **Origins 15→25 regions** (`_NAME_ORIGINS`), now 589 first names: added Vietnam, Turkey, Netherlands, Pacific Islands/Hawaii, Israel, East Africa (Ethiopia), Thailand, Indonesia, Hungary.
- **Pop-culture radar ~117→148** (`_FAMOUS_NAMES`): trending shows (Severance, Shōgun, House of the Dragon, Yellowstone, Bridgerton, Fallout, Invincible, Bluey, Andor), anime (Frieren, Solo Leveling, Berserk, Vinland Saga, Dr. Stone, Dandadan), games (Elden Ring, Black Myth Wukong, Stardew, Sims, Roblox, Skyrim, Genshin, AC), music (BLACKPINK, country, Chappell Roan, Latin).
- **Surname patterns:** added `oglu$`→Turkey, ` van (der )`→Netherlands.
- **Bug fix:** `wall-?e` matched "wallen" → Morgan Wallen mis-tagged as Pixar. Anchored to `wall-?e\b`.
- Verified: 0 syntax errors; all new origins resolve correctly; famous radar hits new entries; false-positive guard clean (Brian/Adrian/Damian/Mark/Rose/Ivanka/Sullivan all correctly NOT matched); Wallen now → country music.

## v1.21.0 — 2026-06-15 — 6 mega dreams (content, balance)
- **DREAMS 22→28:** Own a Skyscraper ($1.5M), F1 Racing Team ($2.2M), Space Tourism Seat ($2.8M), Build a Unicorn ($3.5M), Own a Film Studio ($4.2M), Pro Sports Franchise ($5M) — a "MEGA" stretch tier (`skyscraper/f1team/spaceflight/unicorn/filmstudio/franchise`).
- Closes the balance gap opened by v1.19.0 ($1.5M big deals) + v1.20.0 (elite careers like $12k dentist): old dream ceiling was $1.2M, now $5M for true bragging-rights wins. Cost range $200k–$5M.
- Verified: 28 dreams, no dup ids, all 6 render in the picker, selecting a $5M dream highlights cleanly with 0 JS errors.

## v1.20.0 — 2026-06-15 — 7 new careers (content, user request)
- **PROFS 38→45:** Software Engineer (💻 $9.5k, $30k school debt), Pharmacist (💊 $10.5k, $110k debt), Dentist (🦷 $12k, $280k debt), Veterinarian (🐾 $5.8k, $120k debt), Airline Pilot (✈️ $9k, $60k training debt), Bartender (🍹 $2.9k, debt-free), Social Worker (🫂 $2.7k, hard-mode low income).
- **PROF_EDU_REQ:** degree careers gated in the Career Change machine — Dentist/Pharmacist/Vet require Master's/Doctorate (lvl 3); Software Eng/Pilot/Social Worker require Bachelor's (lvl 2). Initial spin still ignores edu req.
- Each has a full expense/debt profile scaled to salary + a one-line starting story. Verified: 45 careers, no dup ids, all 7 present, edu gates correct, 0 syntax errors.

## v1.19.0 — 2026-06-15 — 15 new investment deals (content, user request)
- **SMALL_DEALS 30→36:** townhouse rental, rental lock-up garages, ATM route, roadside billboard, tiny-home rental, music royalty share (`sd_town/garage/atm/bill/tiny/royalty`).
- **BIG_DEALS 14→23:** 50-unit complex, mobile-home park, roadside motel, RV park, industrial warehouse (NNN), drive-thru QSR ground lease, mixed-use retail+apts, laundromat chain, boutique hotel (`b15`–`b23`) — scaling to $1.5M trophy assets.
- Every niche (re/biz/note/land), small→mega. CF ~0.5-0.7%/mo of cost, downs ~11-13%, consistent with existing. Verified: 36+23 pools, no dup ids, both deal sizes fire (12 events), buying adds an asset, passive finite, 0 errors.

## v1.18.4 — 2026-06-15 — Sync the reveal MP badge on re-select (user-reported)
- Bug: revert to single player on the reveal card, then start a room again (e.g. from the Online Rooms box) → the reveal-card MP badge stayed hidden, because `mpSetCount` only refreshed the spin-card `#mp-mode-banner`, not `#rev-mp-badge`. Fix: `mpSetCount` (and `mpCancelRoomSetup`) now also call `_revMpBadge()`, so both indicators track `_mpCount` no matter which screen/control triggers the change. Verified the exact repro: reveal MP → single → re-select MP (no re-render) → badge reappears.

## v1.18.3 — 2026-06-15 — MP badge + single-player switch on the reveal card (user-reported)
- The reveal/post-spin card (`#rev-card`) showed no MP status and no way back to solo (the sp-card banner is hidden once the reveal shows). Added `#rev-mp-badge` + `_revMpBadge()` (called in `revealProf`): when `_mpCount>1` it shows "👥 MULTIPLAYER · N players" + a "↩ Single Player" button (→ `mpSetCount(1);_revMpBadge()`). Hidden in solo. Verified: badge shows in MP, revert sets count→1 + hides badge, solo shows nothing, 0 errors.

## v1.18.2 — 2026-06-15 — Back-to-single-player from MP (user-reported)
- The `#mp-mode-banner` now includes a "↩ Back to Single Player" button (→ `mpSetCount(1)`); the room-setup Cancel is relabeled "← Back to Single Player"; `mpCancelRoomSetup` now also hides the banner (it set `_mpCount=1` but left the banner showing). Verified both revert paths: count→1, banner hidden, 1P active, room setup closed, 0 errors.

## v1.18.1 — 2026-06-15 — Clearer multiplayer menu UX (user-reported)
- **"Multiplayer selected" indicator:** picking 2-4 players now shows a bold pulsing `#mp-mode-banner` at the top of the spin card ("👥 MULTIPLAYER SELECTED — N players…") driven by `mpSetCount`, so players know they're in MP mode (they didn't before). Hides at 1 player.
- **Join Room moved into the Online Rooms box:** new `#btn-join-online` (🚪 Join a Room by Name → `mpOpenJoinModal`) lives in `#rooms-panel` where it belongs. The old in-card Join button (`.sp-join-row`) is now the **mobile fallback only** (`@media(min-width:1001px){display:none}`) since the rooms box is hidden ≤1000px — so desktop joins from the box, mobile from the card. Verified: banner toggles 1P/2P, online Join wired, 0 errors.

## v1.18.0 — 2026-06-15 — Anonymous session tracking (play time + progress)
- **New telemetry (to answer "are people playing / how long"):** created Supabase table `public.cf_sessions` (RLS: anon INSERT only, no public SELECT — privacy) on project dddcfwbydgtxxwdsvsvt. Client logs one row per session: `duration_s`, `turns`, `won`, `prof`, `mode` (solo/mp), `ended` (win/bankrupt/resign/leave), `ver`, random `device` id (reuses `_deviceId()`, no PII/IP). `_sessionStart()` on startGame/mpLaunchGame/resumeGame; `logSession()` on win/bankruptcy/resign + a `pagehide` keepalive POST (captures players who just close the tab — the typical case). Read aggregates via Supabase MCP (`select avg(duration_s), avg(turns), win rate, count`). Verified end-to-end: test row inserted (dur 7s, turn 12, doctor/solo) then deleted. itch's own analytics has NO play-duration metric, hence this.

## v1.17.7 — 2026-06-14 — 4 new investment deals (content variety)
- Added 4 small deals to `SMALL_DEALS` (now 30): Vending Machine Route (biz), Self-Storage Shares (biz), Solar Lease Royalty (note), Downtown Parking Lot (re/land). Unique non-numeric ids (`sd_*`) to avoid collisions with MARKETS asset refs. More passive-income options per run. Verified: pool=30, no dup ids, 6 deal events fired, buying adds an asset, passive finite, 0 errors.

## v1.17.6 — 2026-06-14 — 6 new doodad event cards (content variety)
- Added 6 doodads to `DOODADS` (now 28): Crypto FOMO, Subscription Creep, Vet Bill (ties into pets), Cracked Phone, Wedding Season, Impulse Upgrade — each with a financial-lesson tip + a cheaper `choice`. More variety per run = fresher replays. Verified: pool=28, all present, 6 events fired, 0 errors. (Bug-hunt this cycle: full save/restore integrity = 0 diffs across 14 state values, all finite — clean.)

## v1.17.5 — 2026-06-14 — Share Game from the menu
- **Engagement/reach:** added a "📣 Share Game" button to the main-menu ⚙️ Settings panel (`_mainSettingsHTML` actions grid) → `shareGame()` uses `navigator.share` (native sheet) with a clipboard + X-intent fallback, sharing the hook line + `tradervert.itch.io/freedom-race`. Rationale: sharing previously only existed on the WIN screen, which most players never reach — this captures every visitor. Verified: button renders, share payload has the correct title/URL/text.

## v1.17.4 — 2026-06-14 — Rate button + clean bug-hunt pass
- **Engagement:** added a gold "⭐ Rate this game" button to the win screen (→ `tradervert.itch.io/freedom-race#rate`). Ratings are itch's #1 ranking signal and the game only has 3 — surfacing this at the win (peak-satisfaction) moment should lift it.
- **Bug-hunt pass (clean):** stress-tested the pet inventory — 30 random adopt/switch/release ops left ZERO salaryBoost drift (pet bonus tracks the active pet exactly, no stacking); income/expense sums intact, monthlyCF consistent, 12 paydays finite, 0 console errors. No fix needed.

## v1.17.3 — 2026-06-14 — DJ Booth free for everyone (+ full feature test)
- **DJ jukebox un-gated:** removed the `dj` perk requirement — the YouTube jukebox is now free for all players (removed the Shop item, `_musMenuHTML` always shows "Play a Song", `jukeboxPrompt` no longer checks ownership). Reason: maximize interaction (the original ✦1500 gate kept most players from ever using it).
- **Full feature test (verified live in-browser):** 8-roll core loop + payday (0 errors); all menus open (Dealer/Realty/Leisure/School/Settings/Shop); pets pet/feed/shop/inventory; **DJ jukebox played a real YouTube video end-to-end** — IFrame API loaded, player reached state PLAYING, `toggleMute` muted it, `jukeboxStop` cued/stopped it (the immediate post-command getters read stale state — YT API is async via postMessage — but settle correctly after ~1s). 0 console errors throughout.

## v1.17.2 — 2026-06-14 — Viral fixes: dead Follow/Support links + Post-on-X
- **BUG (engagement leak):** 5 `freedomrace.itch.io` links (Follow/Support on the win screen, the level-up menu, and main Settings) pointed at the OLD account URL (renamed to `tradervert`). Fixed all → `tradervert.itch.io` / `tradervert.itch.io/freedom-race`. `copyWinResults` already shares `location.href` (correct, no change).
- **Engagement add:** win screen gains a 🐦 **Post on X** button → `shareWinToX()` opens a tweet intent with a brag line (turns + grade + dream) + the game link + #FreedomRace — a one-tap desktop viral path alongside the native-share "Share Score". Verified: buttons render, intent URL valid, no stale links remain.

## v1.17.1 — 2026-06-14 — Pet Shop discoverability
- Added 🛍 Shop / 🎒 My Pets buttons directly on the pet-cam panel (`#pet-shop-btns`) so adopting/switching pets doesn't require digging through Leisure → Your Pet. `_mpLocked` guards on `openPetShop`/`openPetInventory`.

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
