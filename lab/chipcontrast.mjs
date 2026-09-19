/* What contrast does the nav chip label actually meet, against whatever the
   chip is sitting over at that moment? Hides the label, photographs the chip
   surface, and reads a percentile rather than a mean so one antialiased
   pixel cannot decide the answer.
     node lab/chipcontrast.mjs [file] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = process.argv[2] || 'v1.html';
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, FILE)).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(700);
// Hide the labels so the sample is the chip surface, not the letterforms.
await p.addStyleTag({ content: '.tab { color: transparent !important; }' });

const lum = ([r, g, bl]) => {
  const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(bl);
};
const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + .05) / (y + .05); };

const docH = await p.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
let worst = 99, worstAt = '';
const rows = [];
for (let i = 0; i <= 20; i++) {
  const v = +((docH - 1) * i / 20).toFixed(2);
  await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
  await p.waitForTimeout(420);
  const info = await p.evaluate(() => {
    const dark = document.querySelector('[data-nav]').classList.contains('is-dark');
    const chips = [...document.querySelectorAll('.nav__tabs .tab, .tab--menu')]
      .map(e => ({ e, r: e.getBoundingClientRect() }))
      .filter(o => o.r.width > 0)
      .map(o => ({ x: Math.round(o.r.x + 6), y: Math.round(o.r.y + 6),
                   w: Math.round(o.r.width - 12), h: Math.round(o.r.height - 12) }));
    return { dark, chips };
  });
  const ink = info.dark ? [255, 255, 255] : [10, 10, 10];
  let low = 99;
  for (const c of info.chips) {
    const buf = await p.screenshot({ clip: { x: c.x, y: c.y, width: c.w, height: c.h } });
    // decode PNG the cheap way: re-render it through the browser
    const px = await p.evaluate(async b64 => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const out = [];
      for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]]);
      return out;
    }, buf.toString('base64'));
    // 10th percentile by luminance on a light theme (the darkest ground the
    // ink has to sit on), 90th on the dark frame.
    const sorted = px.map(q => ({ q, L: .2126 * q[0] + .7152 * q[1] + .0722 * q[2] }))
                     .sort((a, c) => a.L - c.L);
    const pick = info.dark ? sorted[Math.floor(sorted.length * .9)] : sorted[Math.floor(sorted.length * .1)];
    const r = ratio(ink, pick.q);
    if (r < low) low = r;
  }
  rows.push([v, info.dark, low]);
  if (low < worst) { worst = low; worstAt = v + 'vh' + (info.dark ? ' (dark frame)' : ''); }
}
console.log(`${FILE}`);
for (const [v, dark, r] of rows) {
  const bar = r < 4.5 ? '  BELOW 4.5' : '';
  console.log(`  ${String(v).padStart(6)}vh ${dark ? 'dark' : '    '}   ${r.toFixed(2)} : 1${bar}`);
}
console.log(`  worst ${worst.toFixed(2)} : 1 at ${worstAt}`);
await b.close();
