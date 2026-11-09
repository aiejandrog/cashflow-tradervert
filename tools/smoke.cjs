#!/usr/bin/env node
/**
 * tools/smoke.cjs - headless load check for Freedom Race (index.html).
 *
 *   node tools/smoke.cjs                 serve this folder on a free port, load the game in Chromium,
 *                                        fail on any console error / page error / failed same-origin request
 *   node tools/smoke.cjs --offline       also abort every request to another host (PeerJS, Supabase, Tenor,
 *                                        YouTube, ipify): proves solo play needs no external service
 *   node tools/smoke.cjs --url URL       load an already-running server instead
 *   node tools/smoke.cjs --click "sel"   click a selector after load (repeatable), then re-check errors
 *   node tools/smoke.cjs --out DIR       where screenshots go (default tools/out, gitignored)
 *
 * Exit 0 = PASS, 1 = FAIL, 2 = could not run (playwright missing: npm install && npx playwright install chromium).
 * Writes <out>/desktop.png (1280x800), <out>/mobile.png (375x812) and <out>/smoke.json. No network beyond
 * what the page itself requests; nothing is posted anywhere by this script.
 */
const fs = require('fs'), path = require('path'), http = require('http');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d; };
const clicks = []; args.forEach((a, i) => { if (a === '--click' && args[i + 1]) clicks.push(args[i + 1]); });
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(opt('--out', path.join(__dirname, 'out')));
fs.mkdirSync(OUT, { recursive: true });

let playwright;
try { playwright = require('playwright'); } catch (e) {
  console.error('playwright not installed. Run: npm install && npx playwright install chromium');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

(async () => {
  const own = opt('--url', null) ? null : await serve();
  const url = opt('--url', own && own.url);
  const offline = flag('--offline');
  const origin = new URL(url).origin;
  const report = { url, offline, version: null, consoleErrors: [], pageErrors: [], failedRequests: [], blockedExternal: [], clicks: [], title: null, bodyChars: 0 };

  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => report.pageErrors.push(String(e && e.message || e).slice(0, 300)));
  page.on('requestfailed', (r) => { const u = r.url(); if (u.startsWith(origin)) report.failedRequests.push(u + ' ' + (r.failure() && r.failure().errorText)); });
  if (offline) {
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
      report.blockedExternal.push(new URL(u).host);
      return route.abort('connectionfailed');
    });
  }

  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
  report.title = await page.title();
  report.version = await page.evaluate(() => (typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null)).catch(() => null);
  report.bodyChars = await page.evaluate(() => document.body.innerText.length).catch(() => 0);
  await page.screenshot({ path: path.join(OUT, 'desktop.png') });

  for (const sel of clicks) {
    const before = report.pageErrors.length + report.consoleErrors.length;
    try {
      await page.click(sel, { timeout: 5000 });
      await page.waitForTimeout(800);
      report.clicks.push({ sel, ok: true, newErrors: report.pageErrors.length + report.consoleErrors.length - before });
    } catch (e) { report.clicks.push({ sel, ok: false, error: String(e.message).split('\n')[0] }); }
  }
  if (clicks.length) await page.screenshot({ path: path.join(OUT, 'after-clicks.png') });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'mobile.png') });
  report.mobileHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1).catch(() => null);

  // Phone setup flow (F-qa-02, F-qa-04): Continue buttons must be on-screen and dream cards readable.
  // Own offline contexts (only same-origin requests pass); touch emulation like a real phone.
  report.phoneFlow = [];
  for (const w of [360, 375, 390]) {
    const pc = await browser.newContext({ viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true });
    await pc.route('**/*', (route) => { const u = route.request().url(); return (u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:')) ? route.continue() : route.abort('connectionfailed'); });
    const pp = await pc.newPage(); pp.setDefaultTimeout(8000);
    const row = { width: w };
    try {
      await pp.goto(url, { waitUntil: 'load', timeout: 30000 });
      await pp.waitForTimeout(1500);
      await pp.click('#btn-spin'); await pp.waitForTimeout(5500);
      await pp.click('#btn-begin'); await pp.waitForTimeout(700);
      const right = (id) => pp.evaluate((i) => { const r = document.getElementById(i).getBoundingClientRect(); return { right: Math.round(r.right), inView: r.right <= window.innerWidth && r.left >= 0 && r.width > 0 }; }, id);
      row.charGo = await right('btn-char-go');
      await pp.click('#char-preset-row > *:first-child'); await pp.waitForTimeout(800);
      await pp.click('.loc-card >> nth=0'); await pp.waitForTimeout(500);
      row.locGo = await right('btn-loc-go');
      await pp.evaluate(() => document.getElementById('btn-loc-go').click()); await pp.waitForTimeout(800);
      await pp.click('.dream-card >> nth=0'); await pp.waitForTimeout(500);
      row.dreamGo = await right('btn-dream-go');
      row.dreamCardMinH = await pp.evaluate(() => Math.round(Math.min(...[...document.querySelectorAll('.dream-card')].map((c) => c.getBoundingClientRect().height))));
      if (w === 375) await pp.screenshot({ path: path.join(OUT, 'phone-dream.png') });
      row.ok = row.charGo.inView && row.locGo.inView && row.dreamGo.inView && row.dreamCardMinH >= 60;
    } catch (e) { row.ok = false; row.error = String(e.message).split('\n')[0]; }
    report.phoneFlow.push(row);
    await pc.close();
  }

  await browser.close();
  if (own) own.srv.close();

  // Drop console errors caused only by the deliberate offline aborts (the page may log them).
  const external = /peerjs|supabase|tenor|ipify|youtube|unpkg|jsdelivr|ERR_CONNECTION|Failed to load resource/i;
  const realConsole = offline ? report.consoleErrors.filter((t) => !external.test(t)) : report.consoleErrors;
  const failed = report.pageErrors.length > 0 || realConsole.length > 0 || report.failedRequests.length > 0 || !report.version || report.bodyChars < 50 || report.clicks.some((c) => !c.ok || c.newErrors > 0) || report.phoneFlow.some((r) => !r.ok);
  report.verdict = failed ? 'FAIL' : 'PASS';
  report.blockedExternal = [...new Set(report.blockedExternal)];
  fs.writeFileSync(path.join(OUT, 'smoke.json'), JSON.stringify(report, null, 2));

  console.log(`smoke ${report.verdict}  version=${report.version}  title="${report.title}"  body=${report.bodyChars} chars  offline=${offline}`);
  if (offline) console.log(`  external hosts blocked: ${report.blockedExternal.join(', ') || 'none requested'}`);
  const ignored = offline ? report.consoleErrors.length - realConsole.length : 0;
  console.log(`  page errors: ${report.pageErrors.length}  console errors: ${realConsole.length}${ignored ? ` (+${ignored} from blocked hosts, ignored)` : ''}  failed same-origin requests: ${report.failedRequests.length}  mobile h-overflow: ${report.mobileHorizontalOverflow}`);
  report.pageErrors.slice(0, 5).forEach((e) => console.log('  PAGE ERROR  ' + e));
  realConsole.slice(0, 5).forEach((e) => console.log('  CONSOLE     ' + e));
  report.failedRequests.slice(0, 5).forEach((e) => console.log('  REQUEST     ' + e));
  report.clicks.forEach((c) => console.log(`  click ${c.sel}: ${c.ok ? 'ok, new errors ' + c.newErrors : 'FAILED ' + c.error}`));
  report.phoneFlow.forEach((r) => console.log(`  phone ${r.width}: char-go right=${r.charGo && r.charGo.right} loc-go right=${r.locGo && r.locGo.right} dream-go right=${r.dreamGo && r.dreamGo.right} dream-card min h=${r.dreamCardMinH}px -> ${r.ok ? 'ok' : 'FAIL' + (r.error ? ' ' + r.error : '')}`));
  console.log(`  screenshots + smoke.json in ${OUT}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('smoke could not run:', e.message); process.exit(2); });
