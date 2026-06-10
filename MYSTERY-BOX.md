# Mystery Box — Feature Design Doc
**Game:** Cashflow — Tradervert Edition  
**Feature:** Doubles Roll → Mystery Reward  
**Status:** Shipped

---

## Concept

Roll doubles (same number on both dice) and a mystery gift box appears before you move. Tap it to reveal a randomized reward. Pure dopamine loop baked into an existing mechanic — no extra turns, no new board spaces, no friction.

The box intercepts the move, lets you claim the prize, then sends your token moving. The reward is always a net positive — there are no penalty pulls.

---

## Why It Works

- **Timing is perfect.** Doubles happen ~1 in 6 rolls (16.7%) — frequent enough to feel exciting, rare enough to feel special.  
- **Anticipation before reveal.** The pulsing gift box waits for the tap — it's a slot machine pull in disguise.  
- **Variable reward schedule.** Prizes range from $600 cash to a paid-off rental property. You never know which tier you'll hit.  
- **No downside.** Every box is a win. The only variance is *how big* the win is, which keeps the experience pure dopamine with zero frustration.

---

## Prize Tiers & Weights

| Tier | Weight | ~Frequency | Examples |
|---|---|---|---|
| **Common** | 40 | ~51% | Cash windfall ($500-$2k), Tax refund |
| **Uncommon** | 30 | ~38% | Credit +25, Side hustle payout, Expenses waived |
| **Rare** | 18 | ~23% | Free paid-off rental ($100-250/mo CF), Business stake, Inheritance |
| **Legendary** | 2 | ~2.5% | All credit card debt cleared + Credit +35 |

*(Weights are relative — total pool = ~90. Actual % shown as share of pool.)*

---

## Prize Catalog

### Common
- **💵 Cash Windfall** — Random $500–$2,000 dropped into account. Narrative: surprise bonus, freelance check, lucky break.
- **🧾 Tax Refund** — 40% of your monthly tax expense returned. Scales with your profession.

### Uncommon
- **📈 Credit Score Boost** — Instant +25 credit score points. Meaningful for unlocking better loan rates.
- **💰 Side Hustle Payout** — 50% of your monthly salary as one-time income.
- **🎫 Expenses Waived** — Your NEXT payday collects full income with zero expenses deducted. Stacks cleanly with charity bonus.

### Rare
- **🏠 Free Rental Property** — A paid-off rental added to your assets. CF: $100–$250/mo. Liability: $0. No mortgage, no hold requirement, sellable immediately.
- **🏪 Business Stake** — Equity in a business generating $150–$350/mo distributions. Fully owned.
- **🏛 Inheritance** — $3,000–$8,000 lump sum. One-time, no strings.

### Legendary (2% pull rate)
- **💎 Credit Cards Cleared** — Entire CC liability wiped. Credit +35. If no CC debt exists, player receives +50 credit boost instead. This single prize can meaningfully accelerate the debt kill sequence.

---

## UI Flow

```
1. Player rolls doubles (v1 === v2, standard mode only)
      ↓
2. Mystery overlay fades in (dark bg + blur)
      ↓
3. 🎁 Gift box pulses with gold glow + "Tap to open" hint
      ↓
4. Player taps the box
      ↓
5. Box shakes violently → 18 color particles burst outward
      ↓
6. Box shrinks to zero (CSS scale animation)
      ↓
7. Prize card slides up (spring animation):
   - Tier badge (color-coded: green/blue/purple/gold)
   - Prize icon (large emoji)
   - Prize name + description
      ↓
8. "Claim & Roll →" button dismisses overlay
      ↓
9. Token moves the original dice total as normal
```

---

## Technical Notes

- **Doubles detection:** `v1 === v2` after dice resolve, checked before `moveTokenSteps()` fires.
- **Express mode excluded:** 3-dice rolls skip doubles check (triples would be a future tier).
- **Weighted random:** Each prize has a `weight` field. Pool sum ~90. `Math.random() * total` walks the array — O(n) but pool is small.
- **Waiver flag:** `G._waivedNextPayday = true`. Checked at top of `onPayday()` — adds `expenses().total` back to cash, then clears flag.
- **Mystery assets:** `purchaseTurn = -999` (bypasses 3-turn hold), `liability = 0`, `cashPurchase = true`. Show up in FS like any other owned asset and contribute CF immediately.
- **Legendary CC clear:** Removes the liability, zeroes `expenseOverrides.cc`, applies `boostCredit(35)`. Handles edge case where player has no CC debt (bonus credit instead).

---

## Monetization / PWA Angle

The mystery box mechanic is a natural engagement hook for a monetized version:

- **Ad break before reveal** — "Watch a 15s ad to upgrade your prize tier" (rewarded ad unit)
- **Premium box** — Paid unlock for a guaranteed Rare+ pull ($0.99 IAP)
- **Daily doubles** — Push notification: "You haven't claimed your daily mystery reward"
- **SpillDeals tie-in** — Legendary prize could be "🏠 Exclusive SpillDeals property alert — tap to see a real deal in your city" (deep link out)

The last one is the interesting one. The game drives traffic to SpillDeals. Real financial education → real deal discovery. Same user, same mindset, same action.

---

## Future Ideas

- **Triple roll (express mode):** v1===v2===v3 → guaranteed Legendary
- **Box upgrades:** Charity space donation earlier in the game upgrades your next mystery box tier
- **Streak reward:** 3 doubles in a session unlocks a "Hot Streak" bonus roll
- **Seasonal boxes:** Holiday-themed prizes with different prize pools

---

*Tradervert LLC · Cashflow Game · Feature shipped May 2026*
