/* Walk the whole page at 390 wide, one screenshot per 0.85 screen. node lab/mobile-walk.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += Math.round(844 * 0.85)) {
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/w${String(i).padStart(2, '0')}.png` });
  i++;
}
// small text and tap targets
const small = await p.evaluate(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const n = walker.currentNode; if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fs = parseFloat(cs.fontSize);
    if (fs < 13) out.push({ fs: +fs.toFixed(1), text: n.textContent.trim().slice(0, 40), sec: el.closest('[data-section]')?.dataset.sectionName, cls: el.className?.toString().slice(0, 40) });
  }
  return out;
});
console.log('shots', i, 'errors', JSON.stringify(errs));
console.log('--- text under 13px'); for (const s of small) console.log(JSON.stringify(s));
await b.close();
