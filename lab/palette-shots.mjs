/* PALETTE SHOTS (TJ, 26 Oct 2026)
   Baseline and after screenshots for the palette work, frozen so two runs of the same page give identical pixels.

     node lab/palette-shots.mjs --set <name> [--palette <id>] [--reach <full|button>]

   --palette and --reach set data-palette and data-reach on <html> (addInitScript) and add ?palette=&reach= to the URL.
   Output: lab/shots/palette/<set>/<page>-<width>.png

   Freezing, copied from lockcheck.mjs and extended: CSS animation and transition off, scroll-behavior auto, every video
   paused at 0 s, Web Animations finished (the aurora field is a CSS animation, so the same rule stops it at its first
   frame), fixed scroll position.

   FULL PAGE DECISION: the site has scroll driven and pinned acts, so a native fullPage capture can resize or
   re-pin during the capture. The tool first scrolls the page top to bottom in steps (so reveal observers fire and lazy
   media loads), returns to scroll 0, then takes a fullPage capture capped at 12000px tall via clip. Stability is
   checked by diffing two sets with palette-diff.mjs. */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = n => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : null; };
const SET = arg('set'), PALETTE = arg('palette'), REACH = arg('reach');
if (!SET) { console.error('usage: node lab/palette-shots.mjs --set <name> [--palette <id>] [--reach <full|button>]'); process.exit(1); }
const OUT = path.join(ROOT, 'lab', 'shots', 'palette', SET);
mkdirSync(OUT, { recursive: true });
const SIZES = [[1440, 900], [390, 844]];
const CAP = 12000;
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}';

function urlFor(file) {
  const u = pathToFileURL(path.join(ROOT, 'index', file)).href;
  const q = [];
  if (PALETTE) q.push('palette=' + encodeURIComponent(PALETTE));
  if (REACH) q.push('reach=' + encodeURIComponent(REACH));
  return q.length ? u + '?' + q.join('&') : u;
}

async function open(browser, file, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.route('**/calendly.com/**', r => r.abort());
  if (PALETTE || REACH) await ctx.addInitScript(({ p, r }) => {
    /* The init script runs before <html> exists, so wait for it (Opus, 26 Oct 2026). */
    const apply = () => {
      const el = document.documentElement; if (!el) return false;
      if (p) el.setAttribute('data-palette', p);
      if (r) el.setAttribute('data-reach', r);
      return true;
    };
    if (!apply()) new MutationObserver((m, o) => { if (apply()) o.disconnect(); }).observe(document, { childList: true });
  }, { p: PALETTE, r: REACH });
  const page = await ctx.newPage();
  await page.goto(urlFor(file), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(2800);
  return { ctx, page };
}

async function freeze(page) {
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(async () => {
    document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { a.cancel(); } });
    const vids = [...document.querySelectorAll('video')];
    await Promise.all(vids.map(v => new Promise(res => {
      v.pause(); v.loop = false;
      if (v.readyState < 1 || v.currentTime === 0) return res();
      v.addEventListener('seeked', () => res(), { once: true }); v.currentTime = 0; setTimeout(res, 1500);
    })));
    vids.forEach(v => v.pause());
  });
  await page.waitForTimeout(300);
}

async function walkDown(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  for (let y = 0; y < Math.min(h, CAP + vh); y += Math.round(vh * 0.6)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1800); // 1800 ms settle: the kinetic heading on home finished mid-lerp at 500 ms (0.02 percent diff), stable at 1800
}

async function fullShot(page, file) {
  await walkDown(page);
  await freeze(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const h = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
  const vw = await page.evaluate(() => innerWidth);
  await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: vw, height: Math.min(h, CAP) } });
}

const PAGES = [
  ['home', 'index.html'], ['programmes', 'programmes.html'], ['request-a-place', 'request-a-place.html'],
  ['who-comes-into-your-home', 'who-comes-into-your-home.html'], ['gifts', 'gifts.html'],
];

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const done = [];
const note = f => { done.push(f); console.log('saved ' + f); };

for (const [w, h] of SIZES) {
  for (const [name, file] of PAGES) {
    const { ctx, page } = await open(browser, file, w, h);
    const f = path.join(OUT, `${name}-${w}.png`);
    await fullShot(page, f); note(path.relative(ROOT, f));
    await ctx.close();
  }
  // builder: opening screen, then the summary screen (walk as in bespoke-summary-check.mjs)
  {
    const { ctx, page } = await open(browser, 'build-your-programme.html', w, h);
    await freeze(page);
    let f = path.join(OUT, `build-opening-${w}.png`);
    await page.screenshot({ path: f }); note(path.relative(ROOT, f));
    const name = () => page.evaluate(() => document.querySelector('[data-step-name]').textContent);
    const next = async () => { await page.click('[data-next]'); await page.waitForTimeout(1000); };
    await next();
    await page.evaluate(v => { const e = document.getElementById('due'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, '2027-03-15');
    await page.waitForTimeout(300);
    for (let k = 0; k < 30 && (await name()) !== 'Your programme'; k++) await next();
    await page.waitForTimeout(1500);
    await freeze(page);
    f = path.join(OUT, `build-summary-${w}.png`);
    await page.screenshot({ path: f }); note(path.relative(ROOT, f));
    await ctx.close();
  }
  // footer on the home page
  {
    const { ctx, page } = await open(browser, 'index.html', w, h);
    await walkDown(page);
    await freeze(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    await freeze(page);
    const f = path.join(OUT, `footer-${w}.png`);
    await page.screenshot({ path: f }); note(path.relative(ROOT, f));
    await ctx.close();
  }
}
await browser.close();
console.log(done.length + ' files in ' + path.relative(ROOT, OUT));
