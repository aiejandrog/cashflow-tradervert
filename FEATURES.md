# Cashflow Game — Feature Log
**Project:** Cashflow — Tradervert Edition  
**File:** `index.html` (single-file game)  
**Last updated:** May 2026

---

## Features Shipped (This Session)

### 1. Die-2 Unlock System
- Second die locked by default (🔒 overlay, greyed out)
- Unlocks at **credit ≥ 720** OR **outer board entry**
- Only die-1 counts toward movement while locked
- `isSecondDieUnlocked()` + `syncDie2Lock()` called on every `updateUI()` and `startGame()`
- CSS: `.die-locked` class + `::after` pseudo for 🔒 icon (requires `position:relative` on `.die`)
- `#die2-hint` shows "+X credit to unlock" below dice row

---

### 2. Stock Auto-Calculate
- Typing a dollar amount in stock deal input immediately shows shares/cost/CF live
- `updateStockFromDollar(val)` — no minimum lot clamp on dollar input

---

### 3. FS Liabilities — Custom Pay Amount
- PAY modal for liabilities includes a numeric input for any custom partial payment
- `fsPayModal(liabKey)` uses `openModal({..., customInput:{...}})` pattern

---

### 4. Click Outside to Close
- `#event-modal` backdrop click closes overlay and calls `endTurn()` if turn in progress
- `#modal` backdrop click removed (too many deal flows run through it — caused game freeze)

---

### 5. ROLL Button — Resume Screen (No Glitch)
- **`_resumeFn` global** — tracks the last shown overlay as a re-callable closure
- `showEventCard()`, `openModal()`, `showMysteryBox()` each set `_resumeFn` when called
- `endTurn()` and `claimMysteryPrize()` clear `_resumeFn`
- ROLL button logic:
  - `G.rolling=false` → fresh roll (`rollDice()`)
  - `G.rolling=true` + screen visible → do nothing (already showing)
  - `G.rolling=true` + no screen visible → **call `_resumeFn()`** to restore dismissed screen
  - Fallback (no resume fn): `endTurn()` to safely unstick
- Also checks `#mystery-overlay` visibility

---

### 6. Family/Friends Loan Locked at 720 Credit
- `showBizLoanModal()` — Family/Friends option renders as `.btn-locked` until credit ≥ 720
- `minCredit: 720` field in loan options array

---

### 7. Biz Loan Visible in FS Liabilities
- `buyDeal()` registers biz loans in `G.liabilities` on purchase
- `updateUI()` FS liabilities renders `type==='biz'` assets with PAY button
- Label: `${a.name} Loan` instead of `Mtg`

---

### 8. Financing Modal Freeze Fix
- Root cause: clicking outside `#modal` left `G.rolling=true` stuck
- Fix: removed `onclick` from `#modal` backdrop entirely

---

### 9. Potential CF System for RE Properties
- **At purchase**: RE assets start with `cf=0`, `_potentialCF=deal.cf` stored
- **Deal card**: shows "Potential CF" label (gold) for RE type deals
- **FS asset list**: vacant RE shows `Vacant·Pot$X/mo` in amber
- **FS income**: split into two rows — `RE Rental Income` and `Business Income`
- **`income()`** already returns `{reCF, bizCF}` separately; `updateUI()` now displays both

---

### 10. Credit-Aware Tenant System
- `genOneTenant(baseRent, playerCredit)`:
  - Quality pool shifts with player credit:
    - 720+: `[good,good,good,avg,avg,poor]`
    - 660–719: `[good,good,avg,avg,avg,poor]`
    - 600–659: `[good,avg,avg,avg,poor,poor]`
    - <600: `[avg,avg,poor,poor,poor,poor]`
  - Rent variance: good=95–115%, average=85–100%, poor=75–90%
- `genTenants(count, baseRent, playerCredit)` — sorted best offer first (highest rent)
- `showTenantSearch()`:
  - Uses `a._potentialCF || a.cf` for base rent per unit
  - **Net CF = gross rents − mortgage payment** (not gross)
  - Preview net CF shown per applicant before accepting
  - Airbnb listing also uses net CF formula
- `checkTenantEvents()` tenant leave: `a.cf = gross_rents - mortgagePmt`
- `recalcCF()` helper inside `showTenantSearch()` scope

---

### 11. Forced Loan to Cover
- `ensureCash(needed, label)` — auto-borrows shortage as bank loan, credit −3
  - Called before any mandatory payment that could go negative
- **Background check ($150)**: if short → modal offers "Borrow $150 + Check"
- **Property damage**: `ensureCash(cost, 'property damage repair')` before deducting
- **Legal cost**: `ensureCash(legalCost, 'legal settlement')` before deducting
- **Payday shortfall**: if `G.cash < 0` after payday, auto-borrows to zero

---

### 12. Tutorial — Always On
- `startTutorial()` now runs every new game — `localStorage` skip gate removed
- Skip and "Let's Play!" buttons still dismiss early
- `endTutorial()` still saves to localStorage (harmless)

---

## Key Global Variables

| Variable | Purpose |
|---|---|
| `G` | Full game state object |
| `G.rolling` | Turn lock — `true` while a turn is in progress |
| `G._outerBoard` | `true` when player is on outer board (unlocks die-2) |
| `G.creditScore` | Player credit (650 default) |
| `G._potentialCF` | Stored on RE asset at purchase — max possible CF |
| `G._propState[uid]` | Per-property tenant/strategy state |
| `G._waivedNextPayday` | Mystery box waiver flag |
| `G._livingIn` | UID of property player lives in |
| `_resumeFn` | Last overlay closure — called by ROLL to restore dismissed screens |

---

## Key Functions

| Function | What it does |
|---|---|
| `isSecondDieUnlocked()` | Returns true if die-2 should be active |
| `syncDie2Lock()` | Applies/removes `.die-locked` class + hint text |
| `ensureCash(needed, label)` | Auto-borrows shortage as bank loan |
| `borrowAndBuy(deal, shortage)` | Borrows shortage then calls `buyDeal()` |
| `buyDeal(deal)` | Purchases asset; RE starts at cf=0 with _potentialCF set |
| `genOneTenant(baseRent, credit)` | Credit-aware tenant generator with rent variance |
| `genTenants(count, baseRent, credit)` | Generates N tenants, sorted best offer first |
| `showTenantSearch(uid, unitIdx)` | Tenant placement flow with net CF and forced loan |
| `recalcCF()` | Inner fn in showTenantSearch — sets a.cf = gross - mortgage |
| `checkTenantEvents()` | Tenant leave/damage events each payday |
| `startTutorial()` | Shows tutorial — runs every new game |
| `endTutorial()` | Dismisses tutorial overlay |

---

## Architecture Notes

- **Single file**: entire game is `index.html` (~4700+ lines)
- **No build step**: edit and refresh
- **State**: `G` object, auto-saved to `localStorage` via `saveGame()`
- **Board**: two rings (inner Rat Race + outer Fast Track)
- **Income split**: `income()` returns `{salary, interest, reCF, bizCF, total}`
- **Expenses**: `expenses()` returns named fields + `.total`
- **CF**: `monthlyCF()` = income - expenses; shown on payday

---

*Tradervert LLC · Cashflow Game · May 2026*
