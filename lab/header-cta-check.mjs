/* The header's Request a place button on several pages and widths: its text
   fits inside with room, and it does not collide with the lockup. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const page of ['index.html', 'programmes.html', 'about.html', 'request-a-place.html', 'build-your-programme.html']) {
  for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844], [360, 640]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(process.cwd() + '/index/' + page).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const a = document.querySelector('.tab--cta'); if (!a || !a.offsetParent) return null;
      const ar = a.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(a); const tr = rg.getBoundingClientRect();
      const logo = document.querySelector('.nav__lockup, .nav__brand, .nav [href="index.html"], .nav [href="#content"]');
      const lr = logo ? logo.getBoundingClientRect() : null;
      return { padL: Math.round(tr.left - ar.left), padR: Math.round(ar.right - tr.right), right: Math.round(ar.right), vw: innerWidth, hitsLogo: lr ? (ar.left < lr.right && ar.right > lr.left && ar.top < lr.bottom && ar.bottom > lr.top) : false };
    });
    if (!r) { console.log(`${page.padEnd(26)} ${w}  button hidden here`); await p.close(); continue; }
    const ok = r.padL >= 8 && r.padR >= 8 && r.right <= r.vw && !r.hitsLogo;
    if (!ok) bad++;
    console.log(`${page.padEnd(26)} ${String(w).padEnd(5)} side room ${r.padL}/${r.padR}px  ${r.right <= r.vw ? 'on screen' : 'OFF SCREEN'}  ${r.hitsLogo ? 'HITS LOGO' : ''} ${ok ? 'ok' : 'PROBLEM'}`);
    if (page === 'index.html' && (w === 1440 || w === 390)) await p.screenshot({ path: `lab/shots/b6/header-${w}.png`, clip: { x: 0, y: 0, width: w, height: 110 } });
    await p.close();
  }
}
console.log(bad ? `${bad} problems` : 'all fine');
await b.close();
