#!/usr/bin/env node
/**
 * tools/repro_i01.cjs - I-01 / F-qa-08: the Life Hub panel must not auto-open over the board at turn 0.
 * Fresh profile, offline, Quick Match -> Solo -> skip tutorial. At 1280x800 and 375x812:
 *   1. the Life Hub panel (#fs-panel) is not open at turn 0
 *   2. elementFromPoint at the ROLL button centre is the ROLL button (or a child of it)
 *   3. a real mouse click on ROLL starts a roll (G.rolling or turn advances or a dialog opens)
 *   4. the Life Hub still opens via its normal button (#lifehub-btn)
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
(async () => {
  const { s, url } = await serve(); const origin = new URL(url).origin;
  const browser = await playwright.chromium.launch(); let fails = 0;
  const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
  for (const v of VIEWS) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
    await ctx.route('**/*', rt => { const u = rt.request().url(); return u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:') ? rt.continue() : rt.abort('connectionfailed'); });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
    await page.goto(url); await page.waitForTimeout(1800);
    await page.click('#btn-quickmatch'); await page.waitForTimeout(1600);
    await page.evaluate(() => document.querySelector('#rival-pick div[onclick*="solo"]').click()); await page.waitForTimeout(1600);
    await page.click('text=Skip Tutorial >> visible=true'); await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const b = document.getElementById('center-roll-btn'), r = b.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { open: document.getElementById('fs-panel').classList.contains('open'), top: el && (el.id || el.className), hit: !!el && (el === b || b.contains(el)), turn: G.turn, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.screenshot({ path: path.join(OUT, `fixer-i01-${v.n}-1first.png`) });
    check(!info.open, `${v.n}: Life Hub panel not open at turn 0 (open=${info.open})`);
    check(info.hit, `${v.n}: element at ROLL centre is ROLL (got ${info.top})`);
    await page.mouse.click(info.x, info.y); await page.waitForTimeout(3000);
    const after = await page.evaluate(() => ({ turn: G.turn, rolling: !!G.rolling, pos: G.position, ev: document.getElementById('event-modal').classList.contains('vis'), md: document.getElementById('modal').classList.contains('vis') }));
    check(after.rolling || after.ev || after.md || after.pos !== 0 || after.turn > 0, `${v.n}: real click on ROLL starts a roll ${JSON.stringify(after)}`);
    await page.screenshot({ path: path.join(OUT, `fixer-i01-${v.n}-2rolled.png`) });
    const opened = await page.evaluate(async () => { const t = document.getElementById('lifehub-btn'); const p = document.getElementById('fs-panel'); p.classList.remove('open'); t.click(); await new Promise(r => setTimeout(r, 700)); return p.classList.contains('open'); });
    check(opened, `${v.n}: Life Hub still opens from its button`);
    await page.screenshot({ path: path.join(OUT, `fixer-i01-${v.n}-3hub.png`) });
    check(errs.length === 0, `${v.n}: no page errors ${errs.join('|')}`);
    await ctx.close();
  }
  await browser.close(); s.close();
  console.log(fails ? `FAIL (${fails})` : 'PASS'); process.exit(fails ? 1 : 0);
})();
