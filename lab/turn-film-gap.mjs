/* The gap between the end of What is Postpartum Care (its lowest text or photo)
   and the top of the film frame, and what it is made of. node lab/turn-film-gap.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
  console.log(`${w}x${h}`, await p.evaluate(() => {
    const turn = document.querySelector('.act--turn');
    const low = Math.max(...[...turn.querySelectorAll('.stage__side > *, .stage__frame')].map(e => e.getBoundingClientRect().bottom));
    const frame = document.querySelector('.film__stage').getBoundingClientRect().top;
    const tEnd = turn.getBoundingClientRect().bottom;
    const film = document.querySelector('.film').getBoundingClientRect().top;
    return `gap ${Math.round(frame - low)}px = below the content inside its section ${Math.round(tEnd - low)}px + film section top padding ${Math.round(frame - film)}px`;
  }));
  await p.close();
}
await b.close();
