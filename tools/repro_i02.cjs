#!/usr/bin/env node
/**
 * tools/repro_i02.cjs - I-02: the first-time tutorial must not open on top of the rival picker.
 * Fresh profile, offline. For each viewport and each way of choosing (a rival card, Surprise Me, Solo):
 *   1. Quick Match -> rival picker is up: tutorial overlay must NOT be visible.
 *   2. Pick -> picker is gone, tutorial opens, step 2 highlights a visible ROLL button.
 * Exit 0 = PASS, 1 = FAIL. Screenshots go to --out (default tools/out). Needs: npm install, playwright chromium.
 */
const fs = require('fs'), path = require('path'), http = require('http');
const playwright = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const a = process.argv.slice(2);
const OUT = path.resolve(a.includes('--out') ? a[a.indexOf('--out') + 1] : path.join(__dirname, 'out'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const serve = () => new Promise(r => { const s = http.createServer((q, res) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r({ s, url: `http://127.0.0.1:${s.address().port}/` })); });
const VIEWS = [{ n: 'desktop', w: 1280, h: 800 }, { n: 'mobile', w: 375, h: 812 }];
const PICKS = [{ n: 'card', sel: '#rival-pick div[onclick^="_chooseRival(\'"]:not([onclick*="solo"])' }, { n: 'surprise', sel: '#rival-pick button' }, { n: 'solo', sel: '#rival-pick div[onclick*="solo"]' }];
(async () => {
  const { s, url } = await serve(); const origin = new URL(url).origin;
  const browser = await playwright.chromium.launch(); let fails = 0;
  const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
  for (const v of VIEWS) for (const p of PICKS) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
    await ctx.route('**/*', rt => { const u = rt.request().url(); return u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:') ? rt.continue() : rt.abort('connectionfailed'); });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
    await page.goto(url); await page.waitForTimeout(1800);
    const tag = `${v.n}/${p.n}`;
    await page.click('#btn-quickmatch'); await page.waitForTimeout(1600);
    const vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0.05; }, sel);
    check(await vis('#rival-pick'), `${tag}: rival picker is showing`);
    check(!(await vis('#tut-overlay')), `${tag}: tutorial NOT visible over the picker`);
    await page.screenshot({ path: path.join(OUT, `fixer-i02-${v.n}-${p.n}-1picker.png`) });
    // DOM click: on the broken build the tutorial overlay swallows a real tap (that is the bug)
    await page.evaluate(s => document.querySelector(s).click(), p.sel); await page.waitForTimeout(1600);
    check(!(await page.$('#rival-pick')), `${tag}: picker gone after choosing`);
    check(await vis('#tut-overlay'), `${tag}: tutorial opens after choosing`);
    await page.click('#tut-next-btn'); await page.waitForTimeout(500);
    const roll = await page.evaluate(() => { const b = document.getElementById('center-roll-btn'); const r = b.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return { hi: b.classList.contains('tut-hi'), w: Math.round(r.width), h: Math.round(r.height), onScreen: cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight, noPicker: !document.getElementById('rival-pick') }; });
    check(roll.hi && roll.w > 0 && roll.h > 0 && roll.onScreen && roll.noPicker, `${tag}: step 2 highlights a visible ROLL ${JSON.stringify(roll)}`);
    await page.screenshot({ path: path.join(OUT, `fixer-i02-${v.n}-${p.n}-2tutroll.png`) });
    check(errs.length === 0, `${tag}: no page errors ${errs.join('|')}`);
    await ctx.close();
  }
  await browser.close(); s.close();
  console.log(fails ? `FAIL (${fails})` : 'PASS'); process.exit(fails ? 1 : 0);
})();
