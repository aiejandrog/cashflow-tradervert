# Decisions needed from Alex

Append only. Each entry: date, who, the question, the options with the risk of each, a recommendation,
and what the agent did instead in the meantime. Nothing ships, spends or changes a rule without Alex.

## 2026-11-08  setup session  Five failing tests in game.test.js

- **Question:** `game.test.js` has 5 assertions written against May 2026 data that fail on v1.29.0:
  default city (`atlanta` expected, `charlotte` now), NY salary vs Atlanta, Houston vs LA expenses,
  Subscription Creep cost ($0 expected, $60 now), school milestone at turn 8 after a birth.
- **Options:** (a) the game is right and the tests are stale: rewrite the 5 assertions to current data;
  (b) one or more are regressions (the Subscription Creep "$0 audit & cancel" choice and the school
  milestone read like intended mechanics): fix the game; (c) leave them red as the baseline.
- **Recommendation:** `balance` reads each one against `FEATURES.md` and the June changelog and files one
  ticket per test with its verdict; `chief` approves fixes to tests or game per ticket. No blanket rewrite.
- **Meanwhile:** left red. `gate` uses "41 pass / 5 fail, same ids" as the main baseline.
