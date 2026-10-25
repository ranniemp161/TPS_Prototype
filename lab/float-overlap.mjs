/* Wheel through the bath on a phone and report whether "Well deserved"
   (the floating copy) ever overlaps the What is Postpartum Care title or text
   while both are visible. node lab/float-overlap.mjs [w] [h] [step] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '390', h = '844', step = '120'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
await p.mouse.move(+w / 2, +h / 2);
let worst = null;
for (let i = 0; i < 80; i++) {
  await p.mouse.wheel(0, +step); await p.waitForTimeout(260);
  const r = await p.evaluate(() => {
    const f = document.querySelector('.bath__float .bath__lines');
    const op = f ? parseFloat(getComputedStyle(document.querySelector('.bath__float')).opacity) : 0;
    const fr = f && f.getBoundingClientRect();
    const t = document.querySelector('.act--turn .stage__side').getBoundingClientRect();
    const tOp = parseFloat(getComputedStyle(document.querySelector('#confinement-heading')).opacity);
    return { op, fb: fr ? fr.bottom : -1, ft: fr ? fr.top : -1, tt: t.top, y: scrollY };
  });
  if (r.op > 0.05 && r.fb > r.tt && r.ft < r.tt + 400) {
    const overlap = Math.round(r.fb - r.tt);
    if (!worst || overlap > worst.overlap) worst = { ...r, overlap, i };
    await p.screenshot({ path: `lab/shots/filmmove/overlap-${w}-${i}.png` });
  }
}
console.log(worst ? `OVERLAP: up to ${worst.overlap}px while Well deserved is at ${worst.op.toFixed(2)} opacity (frame ${worst.i})` : 'Well deserved never overlaps What is Postpartum Care');
await b.close();
