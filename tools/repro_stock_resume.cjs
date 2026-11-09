#!/usr/bin/env node
/**
 * tools/repro_stock_resume.cjs - F-balance-01 part B (stock price card compounds on resume).
 *
 * Land on an owned stock (the price-move card), dismiss the card, tap the ROLL button repeatedly and read
 * G._stockPrices. Before the fix every tap re-opened the card with a fresh +-15-35% roll and wrote it to
 * G._stockPrices, so the price drifted/compounded. After the fix a resume re-shows the SAME move.
 *
 *   node tools/repro_stock_resume.cjs [--root DIR]   (default: this repo; --root points at another checkout)
 *
 * Exit 0 = PASS (price unchanged after taps), 1 = FAIL (price changed). 2 = could not run.
 * Offline: every request to another host is aborted. Nothing is posted anywhere.
 */
const fs = require('fs'), path = require('path'), http = require('http');
const args = process.argv.slice(2);
const ri = args.indexOf('--root');
const ROOT = path.resolve(ri >= 0 ? args[ri + 1] : path.join(__dirname, '..'));
let playwright;
try { playwright = require('playwright'); } catch (e) { console.error('playwright not installed'); process.exit(2); }

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const serve = () => new Promise((resolve) => {
  const s = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(ROOT, u === '/' ? 'index.html' : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => resolve({ s, url: `http://127.0.0.1:${s.address().port}/` }));
});

(async () => {
  const srv = await serve();
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const origin = new URL(srv.url).origin;
  await ctx.route('**/*', (rt) => { const u = rt.request().url(); return u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:') ? rt.continue() : rt.abort('connectionfailed'); });
  const page = await ctx.newPage();
  await page.goto(srv.url); await page.waitForTimeout(1500);
  await page.click('#btn-quickmatch'); await page.waitForTimeout(3000);
  await page.click('text=Skip Tutorial >> visible=true').catch(() => {}); await page.waitForTimeout(500);
  await page.click('text=Solo — No Rival').catch(() => {}); await page.waitForTimeout(1200);

  // Own a stock and land on its price-move card (the only non-UI step: the dice are random).
  const start = await page.evaluate(() => {
    const deal = { id: 's7', type: 'stock', name: 'GFI Corp', cost: 20, shares: 100, cf: 0 };
    G.assets.push({ uid: 'repro_st', id: deal.id, type: 'stock', name: deal.name, shares: 100, cost: 2000, cf: 0 });
    G._stockPrices = G._stockPrices || {}; G._stockPrices[deal.id] = 20;
    G.rolling = true;
    showStockDealEvent(deal);
    return G._stockPrices[deal.id];
  });
  const seq = [start];
  for (let i = 0; i < 6; i++) {
    // dismiss the card the way a player does (tap away), then tap the ROLL button
    await page.evaluate(() => closeEventCard()); await page.waitForTimeout(500);
    await page.click('#center-roll-btn', { timeout: 3000 }).catch((e) => console.log('roll click:', e.message.split('\n')[0]));
    await page.waitForTimeout(400);
    seq.push(await page.evaluate(() => G._stockPrices.s7));
    if (args.includes('--debug')) console.log(await page.evaluate(() => JSON.stringify({ rolling: G.rolling, resume: String(_resumeFn).slice(0, 70), cardVisible: document.getElementById('event-modal').classList.contains('vis'), btn: getComputedStyle(document.getElementById('center-roll-btn')).display })));
  }
  console.log('G._stockPrices.s7 after landing, then after 6 ROLL taps:', seq.join(' -> '));
  await browser.close(); srv.s.close();
  const same = seq.every((v) => v === seq[0]);
  console.log(same ? 'PASS: price unchanged by resume taps' : 'FAIL: price changed on resume (re-rolled and re-applied)');
  process.exit(same ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
