/* Probe: does pressing Next scroll the window? node lab/deck-probe.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.waitForLoadState("load"); await p.waitForTimeout(1200); p.on("console", m => console.log("PAGE", m.text()));
const info = await p.evaluate(async () => {
  const dk = document.querySelector(".dk"), cs = getComputedStyle(dk);
  const rows = { display: cs.display, rows: cs.gridTemplateRows, kids: [...dk.children].map(c => c.className + ":" + Math.round(c.getBoundingClientRect().top) + "-" + Math.round(c.getBoundingClientRect().bottom)) };
  console.log(JSON.stringify(rows));
  const chain = []; let n = dk; while (n && n !== document.documentElement) { const c = getComputedStyle(n); chain.push(n.tagName + "." + (n.className||"") + " pt=" + c.paddingTop + " mt=" + c.marginTop + " top=" + Math.round(n.getBoundingClientRect().top)); n = n.parentElement; }
  const prev = []; let s = dk.previousElementSibling; while (s) { prev.push(s.tagName + "." + s.className + " h=" + Math.round(s.getBoundingClientRect().height) + " pos=" + getComputedStyle(s).position); s = s.previousElementSibling; }
  console.log(JSON.stringify({ chain, prev }));
  const b = document.querySelector('[data-next]');
  const r0 = b.getBoundingClientRect();
  const log = [];
  window.addEventListener('scroll', () => log.push(Math.round(scrollY)), { passive: true });
  b.click();
  await new Promise(r => setTimeout(r, 1200));
  return { btnTop: Math.round(r0.top), btnBottom: Math.round(r0.bottom), vh: innerHeight, scrollY, log: log.slice(0, 8),
    dkH: Math.round(document.querySelector('.dk').getBoundingClientRect().height), docH: document.documentElement.scrollHeight,
    focus: document.activeElement && document.activeElement.className };
});
console.log(JSON.stringify(info));
await b.close();
