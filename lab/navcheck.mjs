/* Check the nav row for real faults across many window sizes, including the
   short viewports a zoomed browser produces. Reports collisions and overflow
   rather than opinions.
     node lab/navcheck.mjs [file] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = process.argv[2] || 'v1.html';
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

const SIZES = [
  [1920,1080],[1904,945],[1731,859],[1600,900],[1523,756],[1440,900],[1366,768],
  [1280,720],[1269,630],[1200,600],[1097,545],[1024,768],[990,500],[900,600],
  [860,700],[820,900],[768,1024],[700,800],[600,800],[480,800],[430,932],[390,844],[360,740]
];

const R = () => {
  const q = s => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top),
             b: Math.round(r.bottom), w: Math.round(r.width),
             // offsetParent is null for any fixed element, and a child of a
             // display:none parent reports its own display normally, so
             // neither answers "is this on screen". checkVisibility does.
             vis: r.width > 0 && r.height > 0 &&
                  (e.checkVisibility ? e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true) }; };
  // Measure, do not ask. A tab inside a hidden .nav__tabs still reports its
  // own display as inline, so only a real box counts as showing.
  const tabs = [...document.querySelectorAll('.nav__tabs .tab')]
    .map(t => t.getBoundingClientRect())
    .filter(r => r.width > 0 && r.height > 0)
    .map(r => ({ l: Math.round(r.left), r: Math.round(r.right) }));
  return {
    nav: q('[data-nav]'), mark: q('.nav__brand'), cta: q('.tab--cta'),
    burger: q('.tab--menu'), tabs,
    docW: Math.round(document.documentElement.scrollWidth),
    winW: window.innerWidth
  };
};

let fails = 0;
for (const [w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, FILE)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(500);
  const r = await p.evaluate(R);
  const bad = [];
  const hit = (a, c) => a && c && a.vis && c.vis && !(a.r <= c.l || a.l >= c.r);

  if (!r.nav || !r.nav.vis || r.nav.t !== 0) bad.push('nav not pinned at top');
  if (r.mark && r.mark.vis && (r.mark.l < 0 || r.mark.r > w)) bad.push('wordmark outside the window');
  if (hit(r.mark, r.cta)) bad.push('wordmark overlaps Enquire');
  const leftEdge = r.burger && r.burger.vis ? r.burger : (r.tabs.length ? { l: r.tabs[0].l, r: r.tabs[r.tabs.length-1].r, vis: true } : null);
  if (hit(leftEdge, r.mark)) bad.push('tab group overlaps the wordmark');
  if (hit(leftEdge, r.cta)) bad.push('tab group overlaps Enquire');
  if (r.docW > r.winW + 1) bad.push(`horizontal overflow, document ${r.docW} in ${r.winW}`);
  if (r.tabs.length && r.burger && r.burger.vis) bad.push('Menu chip and the three tabs are both showing');

  if (bad.length) { fails++; console.log(`${(w+'x'+h).padEnd(10)} FAIL  ${bad.join('; ')}`); }
  else console.log(`${(w+'x'+h).padEnd(10)} ok    tabs ${r.tabs.length}${r.burger && r.burger.vis ? ' + Menu' : ''}   mark ${r.mark ? r.mark.l+'-'+r.mark.r : '?'}   cta ${r.cta ? r.cta.l : '?'}`);
  await p.close();
}
console.log(fails ? `\n${fails} size(s) fail.` : '\nNav holds at every size tested.');
await b.close();
