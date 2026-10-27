// What We Do: after the reveal, the care section's buttons take clicks (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
for (const at of [0.05, 0.6]) {
  await p.evaluate(at => { const s = window.__flight.state(); window.scrollTo(0, s.top + s.trackVh * s.vh + at * s.vh); }, at);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const t = document.querySelector('[data-hd-kind] .hd__toggle'); const b = t.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { onToggle: !!hit && (hit === t || t.contains(hit)), hit: hit && hit.className };
  });
  console.log(at, JSON.stringify(r));
}
await b.close();
