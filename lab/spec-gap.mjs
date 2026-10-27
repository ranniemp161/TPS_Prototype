/* Your Postpartum Specialist on phones: the gap above the title and between title and portrait.
   node lab/spec-gap.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 640], [430, 932]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
  console.log(w, h, JSON.stringify(await p.evaluate(() => {
    const abs = e => { const r = e.getBoundingClientRect(); return { t: r.top + scrollY, b: r.bottom + scrollY, w: r.width }; };
    const spec = document.querySelector('#specialist'), prev = spec.previousElementSibling;
    const t = abs(spec.querySelector('.wh2')), f = abs(document.querySelector('[data-spec-frame]')), s = abs(spec), pr = abs(prev);
    const words = [...spec.querySelectorAll('.wh2 .kin-line > span')].map(e => Math.round(e.getBoundingClientRect().width));
    return { prevEnd: Math.round(pr.b), specTop: Math.round(s.t), aboveTitle: Math.round(t.t - pr.b), titleToImage: Math.round(f.t - t.b), fontSize: getComputedStyle(spec.querySelector('.wh2')).fontSize, words };
  })));
  await p.close();
}
await b.close();
