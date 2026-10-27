/* Your Postpartum Specialist title on one line (phones): its width in ems, and its
   width, the portrait's and the gaps at several phone widths.
   node lab/spec-oneline-measure.mjs [measure] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [360, 390, 430, 700]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
  if (process.argv[2] === 'measure') await p.addStyleTag({ content: '@media(max-width:860px){.spec .wh2{width:max-content!important;white-space:nowrap!important;font-size:100px!important}}' });
  await p.waitForTimeout(600);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const spec = document.querySelector('#specialist'), t = spec.querySelector('.wh2'), f = document.querySelector('[data-spec-frame]'), prev = spec.previousElementSibling;
    const lines = t.querySelectorAll('.kin-line'), span = lines[0] && lines[0].firstElementChild;
    const tr = t.getBoundingClientRect(), fr = f.getBoundingClientRect(), pr = prev.getBoundingClientRect();
    const rng = document.createRange(); rng.selectNodeContents(t); const textW = rng.getBoundingClientRect();
    return { lines: lines.length, fontPx: getComputedStyle(t).fontSize, textW: Math.round(textW.width * 10) / 10, textL: Math.round(textW.left), textR: Math.round(innerWidth - textW.right), frameW: Math.round(fr.width), above: Math.round(tr.top - pr.bottom), below: Math.round(fr.top - tr.bottom), overflowX: document.documentElement.scrollWidth > innerWidth, titleH: Math.round(tr.height) };
  })), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
