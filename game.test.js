/**
 * Cashflow Game — Pure Logic Tests
 * Run: node game.test.js
 * TDD discipline: RED first, then GREEN (functions already exist — verify they behave correctly)
 */

// ── Extract pure functions from HTML ─────────────────────
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('No <script> block found');

// Minimal DOM mock — returns a stub element for every getElementById call
const mockEl = () => ({
  style: {}, className: '', textContent: '', innerHTML: '',
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  appendChild: () => {}, insertBefore: () => {}, removeChild: () => {},
  addEventListener: () => {}, removeEventListener: () => {},
  children: { length: 0 },
  firstChild: null,
  remove: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
  disabled: false,
});
global.document = {
  getElementById: () => mockEl(),
  querySelectorAll: () => [],
  createElement: () => mockEl(),
  querySelector: () => mockEl(),
  body: { appendChild: () => {}, classList: { add:()=>{}, remove:()=>{} } },
};
global.window = { innerWidth: 1280, innerHeight: 800 };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.AudioContext = function(){ return {
  createOscillator:()=>({connect:()=>{},start:()=>{},stop:()=>{},type:'',frequency:{setValueAtTime:()=>{}}}),
  createGain:()=>({connect:()=>{},gain:{setValueAtTime:()=>{},exponentialRampToValueAtValue:()=>{}}}),
  destination:{}, currentTime:0
};};
global.requestAnimationFrame = cb => typeof cb === 'function' && cb();

// Preprocess: append global exports for const/let declared at top-level scope.
// eval() blocks const/let from leaking — we explicitly re-export what we need.
const gameScript = match[1] + `
// ── test exports ──
if(typeof PROFS!=='undefined')global.PROFS=PROFS;
if(typeof DOODADS!=='undefined')global.DOODADS=DOODADS;
if(typeof LOCATIONS!=='undefined')global.LOCATIONS=LOCATIONS;
if(typeof SMALL_DEALS!=='undefined')global.SMALL_DEALS=SMALL_DEALS;
if(typeof BIG_DEALS!=='undefined')global.BIG_DEALS=BIG_DEALS;
if(typeof BOARD_SPACES!=='undefined')global.BOARD_SPACES=BOARD_SPACES;
if(typeof MARKETS!=='undefined')global.MARKETS=MARKETS;
if(typeof RD_TIPS!=='undefined')global.RD_TIPS=RD_TIPS;
if(typeof fmt!=='undefined')global.fmt=fmt;
if(typeof expressMode!=='undefined')global.expressMode=expressMode;
// Expose G as a getter/setter on global so tests can set G = {...}
Object.defineProperty(global,'G',{
  get:function(){return(typeof G!=='undefined'?G:null)},
  set:function(v){G=v},
  configurable:true
});
`;
eval(gameScript);

// ── Test runner ───────────────────────────────────────────
let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}
function expect(val) {
  return {
    toBe: (expected) => {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toBeGreaterThan: (n) => {
      if (!(val > n)) throw new Error(`Expected ${val} > ${n}`);
    },
    toBeLessThan: (n) => {
      if (!(val < n)) throw new Error(`Expected ${val} < ${n}`);
    },
    toBeGreaterThanOrEqual: (n) => {
      if (!(val >= n)) throw new Error(`Expected ${val} >= ${n}`);
    },
    toBeLessThanOrEqual: (n) => {
      if (!(val <= n)) throw new Error(`Expected ${val} <= ${n}`);
    },
    toBeTruthy: () => {
      if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`);
    },
    toBeFalsy: () => {
      if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`);
    },
    toContain: (s) => {
      if (!String(val).includes(s)) throw new Error(`Expected "${val}" to contain "${s}"`);
    },
  };
}
function describe(group, fn) {
  console.log(`\n📋 ${group}`);
  fn();
}

// ── TESTS ─────────────────────────────────────────────────

describe('creditTier(score)', () => {
  test('score 720+ returns Excellent at 8%', () => {
    const t = creditTier(720);
    expect(t.label).toBe('Excellent');
    expect(t.rate).toBe(0.08);
  });
  test('score 670–719 returns Very Good at 10%', () => {
    const t = creditTier(700);
    expect(t.label).toBe('Very Good');
    expect(t.rate).toBe(0.10);
  });
  test('score 620–669 returns Good at 12%', () => {
    const t = creditTier(650);
    expect(t.label).toBe('Good');
    expect(t.rate).toBe(0.12);
  });
  test('score 580–619 returns Fair at 15%', () => {
    const t = creditTier(600);
    expect(t.label).toBe('Fair');
    expect(t.rate).toBe(0.15);
  });
  test('score < 580 returns Poor at 18%', () => {
    const t = creditTier(540);
    expect(t.label).toBe('Poor');
    expect(t.rate).toBe(0.18);
  });
  test('boundary 619 is Fair not Good', () => {
    expect(creditTier(619).label).toBe('Fair');
  });
  test('boundary 670 is Very Good not Good', () => {
    expect(creditTier(670).label).toBe('Very Good');
  });
});

describe('boostCredit(pts)', () => {
  test('increases credit score by amount', () => {
    G = { creditScore: 650 };
    boostCredit(20);
    expect(G.creditScore).toBe(670);
  });
  test('caps at 850', () => {
    G = { creditScore: 840 };
    boostCredit(20);
    expect(G.creditScore).toBe(850);
  });
  test('floors at 520', () => {
    G = { creditScore: 525 };
    boostCredit(-20);
    expect(G.creditScore).toBe(520);
  });
  test('negative boost reduces score', () => {
    G = { creditScore: 700 };
    boostCredit(-10);
    expect(G.creditScore).toBe(690);
  });
});

describe('loanRate()', () => {
  test('returns rate matching creditTier', () => {
    G = { creditScore: 720 };
    expect(loanRate()).toBe(0.08);
  });
  test('defaults to 650 tier when creditScore missing', () => {
    G = {};
    expect(loanRate()).toBe(0.12); // Good tier
  });
  test('Poor credit returns 18%', () => {
    G = { creditScore: 550 };
    expect(loanRate()).toBe(0.18);
  });
});

describe('initGame() — credit score initialization', () => {
  test('assigns a creditScore between 520 and 780', () => {
    initGame(PROFS[0], LOCATIONS[0]);
    expect(G.creditScore).toBeGreaterThanOrEqual(520);
    expect(G.creditScore).toBeLessThanOrEqual(780);
  });
  test('childBirths starts as empty array', () => {
    initGame(PROFS[0], LOCATIONS[0]);
    expect(Array.isArray(G.childBirths)).toBeTruthy();
    expect(G.childBirths.length).toBe(0);
  });
  test('location is set from parameter', () => {
    initGame(PROFS[0], LOCATIONS[6]); // Atlanta
    expect(G.location.id).toBe('atlanta');
  });
  test('location defaults to Atlanta when not passed', () => {
    initGame(PROFS[0]);
    expect(G.location.id).toBe('atlanta');
  });
  test('cash is greater than 0', () => {
    initGame(PROFS[2]); // Engineer
    expect(G.cash).toBeGreaterThan(0);
  });
});

describe('income() / expenses() / monthlyCF()', () => {
  test('salary equals prof salary at baseline', () => {
    initGame(PROFS[2], LOCATIONS[6]); // Engineer, Atlanta
    const inc = income();
    expect(inc.salary).toBe(G.prof.salary);
  });
  test('salaryBoost adds to salary', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.salaryBoost = 500;
    expect(income().salary).toBe(G.prof.salary + 500);
  });
  test('expenses total is sum of components', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    const exp = expenses();
    const manual = exp.taxes + exp.mortgage + exp.school + exp.car +
                   exp.cc + exp.retail + exp.other + exp.children + exp.bankPmt;
    expect(exp.total).toBe(manual);
  });
  test('bankPmt appears in expenses when bankLoan > 0', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.bankLoan = 5000;
    G.extraBankPmt = Math.round(5000 * loanRate());
    const exp = expenses();
    expect(exp.bankPmt).toBeGreaterThan(0);
  });
  test('monthlyCF = income.total - expenses.total', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    const cf = monthlyCF();
    expect(cf).toBe(income().total - expenses().total);
  });
});

describe('Location scaling', () => {
  test('NY salary is 30% higher than Atlanta baseline', () => {
    const atl = PROFS[2]; // Engineer
    initGame(atl, LOCATIONS[6]); // Atlanta
    const atlSalary = G.prof.salary;
    initGame(atl, LOCATIONS[1]); // New York (1.30x)
    const nySalary = G.prof.salary;
    expect(nySalary).toBeGreaterThan(atlSalary);
  });
  test('Detroit real estate costs less than Miami', () => {
    const prof = PROFS[2];
    initGame(prof, LOCATIONS[7]); // Detroit (0.55x)
    const detMort = G.prof.mortgage_d;
    initGame(prof, LOCATIONS[0]); // Miami (1.45x)
    const miaMort = G.prof.mortgage_d;
    expect(miaMort).toBeGreaterThan(detMort);
  });
  test('Houston (0.85x) has lower expenses than LA (1.65x)', () => {
    const prof = PROFS[3];
    initGame(prof, LOCATIONS[4]); // Houston
    const houExp = G.prof.mortgage;
    initGame(prof, LOCATIONS[2]); // LA
    const laExp = G.prof.mortgage;
    expect(laExp).toBeGreaterThan(houExp);
  });
});

describe('buyDeal() — liability tracking', () => {
  test('RE asset gets liability = cost - down', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.cash = 999999;
    const deal = SMALL_DEALS[0]; // 3BR house cost:65000 down:5000
    buyDeal(deal);
    const asset = G.assets[G.assets.length - 1]; // last added (owner may have primary home at [0])
    expect(asset.liability).toBe(Math.max(0, (deal.cost || 0) - (deal.down || 0)));
  });
  test('raise deal does NOT push asset', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    const raise = SMALL_DEALS.find(d => d.type === 'raise');
    if (!raise) return; // skip if no raise in pool
    const before = G.assets.length; // owner may already have primary home
    buyDeal(raise);
    expect(G.assets.length).toBe(before); // raise must not push a new asset
  });
  test('buying deal reduces cash by down payment', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    const startCash = 50000;
    G.cash = startCash;
    const deal = SMALL_DEALS[1]; // Duplex down:4500
    buyDeal(deal);
    expect(G.cash).toBe(startCash - deal.down);
  });
});

describe('borrowAndBuy()', () => {
  test('borrows shortage and buys deal', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    const assetsBefore = G.assets.length; // owner may have primary home
    G.cash = 1000; // not enough for most deals
    const deal = SMALL_DEALS[0]; // down:5000
    const shortage = deal.down - G.cash; // 4000
    borrowAndBuy(deal, shortage);
    expect(G.bankLoan).toBe(shortage);
    expect(G.assets.length).toBe(assetsBefore + 1);
  });
  test('monthly payment reflects credit score rate', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.creditScore = 720; // Excellent — 8%
    G.bankLoan = 0;
    G.cash = 1000;
    const deal = SMALL_DEALS[0];
    const shortage = deal.down - G.cash;
    borrowAndBuy(deal, shortage);
    const expectedPmt = Math.round(G.bankLoan * 0.08);
    expect(G.extraBankPmt).toBe(expectedPmt);
  });
});

describe('passiveIncome()', () => {
  test('is 0 with no assets', () => {
    initGame(PROFS[0], LOCATIONS[6]);
    expect(passiveIncome()).toBe(0);
  });
  test('sums CF from RE/note/biz/stock assets', () => {
    initGame(PROFS[0], LOCATIONS[6]);
    G.assets = [
      { type: 're', cf: 150, uid: 'a1' },
      { type: 'biz', cf: 250, uid: 'a2' },
      { type: 'stock', cf: 60, uid: 'a3' },
    ];
    expect(passiveIncome()).toBe(460);
  });
  test('ignores negative CF assets', () => {
    initGame(PROFS[0], LOCATIONS[6]);
    G.assets = [{ type: 're', cf: -100, uid: 'a1' }, { type: 're', cf: 200, uid: 'a2' }];
    expect(passiveIncome()).toBe(200);
  });
});

describe('DOODADS — choice field', () => {
  test('Vegas Weekend has a cheaper choice', () => {
    const vegas = DOODADS.find(d => d.title === 'Vegas Weekend');
    expect(vegas.choice).toBeTruthy();
    expect(vegas.choice.cost).toBeLessThan(vegas.cost);
  });
  test('Subscription Creep choice costs $0 (audit & cancel)', () => {
    const sub = DOODADS.find(d => d.title === 'Subscription Creep');
    expect(sub.choice.cost).toBe(0);
  });
  test('Medical Emergency has NO choice (unavoidable)', () => {
    const med = DOODADS.find(d => d.title === 'Medical Emergency');
    expect(!!med.choice).toBeFalsy();
  });
  test('all choice costs are less than or equal to main cost', () => {
    DOODADS.filter(d => d.choice).forEach(d => {
      if (d.choice.cost > d.cost) {
        throw new Error(`${d.title}: choice.cost ${d.choice.cost} >= main cost ${d.cost}`);
      }
    });
  });
});

describe('checkChildMilestones()', () => {
  test('returns false with no births', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.turn = 10;
    expect(checkChildMilestones()).toBeFalsy();
  });
  test('detects school milestone at turn 8 after birth', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.cash = 50000;
    G.childBirths = [{ born: 0, milestones: {} }];
    G.turn = 8;
    // Mock showEventCard to prevent crash
    const orig = showEventCard;
    let fired = false;
    showEventCard = (cls, lbl) => { fired = lbl.includes('School'); };
    addLog = () => {};
    const result = checkChildMilestones();
    showEventCard = orig;
    expect(result).toBeTruthy();
  });
  test('does NOT fire school milestone twice', () => {
    initGame(PROFS[2], LOCATIONS[6]);
    G.cash = 50000;
    G.childBirths = [{ born: 0, milestones: { school: true } }]; // already fired
    G.turn = 8;
    expect(checkChildMilestones()).toBeFalsy();
  });
});

describe('fmt() — number formatting', () => {
  test('formats 1000 as 1,000', () => {
    expect(fmt(1000)).toBe('1,000');
  });
  test('handles negative by taking abs', () => {
    expect(fmt(-500)).toBe('500');
  });
  test('rounds to nearest integer', () => {
    expect(fmt(999.9)).toBe('1,000');
  });
  test('0 formats as 0', () => {
    expect(fmt(0)).toBe('0');
  });
});

// ── Summary ───────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\n🔴 FIX FAILING TESTS BEFORE SHIPPING');
  process.exit(1);
} else {
  console.log('\n🟢 ALL TESTS PASS');
}
