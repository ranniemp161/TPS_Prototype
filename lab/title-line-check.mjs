/* Is "What is Postpartum Care?" one line, and does it stay inside its column and clear of the photo?
   node lab/title-line-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1920, 1080], [1440, 900], [1280, 720], [1100, 800], [1024, 768], [820, 1100], [430, 932], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const t = document.querySelector('#confinement-heading');
    const lines = t.querySelectorAll('.kin-line').length;
    const tr = t.getBoundingClientRect();
    const text = [...t.querySelectorAll('.kin-line > span')].reduce((m, e) => { const rg = document.createRange(); rg.selectNodeContents(e); return Math.max(m, rg.getBoundingClientRect().right); }, 0);
    const side = document.querySelector('.act--turn .stage__side').getBoundingClientRect();
    const frame = document.querySelector('.act--turn .stage__frame').getBoundingClientRect();
    const sideRight = Math.round(side.right);
    return { lines, h: Math.round(tr.height), textRight: Math.round(text), colRight: sideRight, photoLeft: Math.round(frame.left), photoTop: Math.round(frame.top), titleTop: Math.round(tr.top), titleBottom: Math.round(tr.bottom), vw: innerWidth };
  });
  const sideBySide = r.photoLeft > 300 && Math.abs(r.photoTop - r.titleTop) < 600 && r.photoLeft > r.colRight - 80;
  const clearOfPhoto = r.photoLeft >= r.vw ? true : (r.textRight < r.photoLeft - 8 || r.titleBottom <= r.photoTop);
  console.log(`${String(w).padStart(5)}x${String(h).padEnd(5)} lines ${r.lines}  text ends ${String(r.textRight).padStart(4)}  column ends ${String(r.colRight).padStart(4)}  photo starts ${String(r.photoLeft).padStart(4)}  ${r.textRight <= r.vw - 8 ? 'inside window' : 'OFF SCREEN'}  ${clearOfPhoto ? 'clear of photo' : 'TOUCHES PHOTO'}`);
  await p.close();
}
await b.close();
