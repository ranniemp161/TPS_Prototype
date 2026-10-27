// Home, However Long You Need: the heading block centred over the picker (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => window.scrollBy(0, document.querySelector('.act--programmes .sec-head').getBoundingClientRect().top - 90));
  await p.waitForTimeout(2000);
  const m = await p.evaluate(() => {
    const mid = el => { const r = el.getBoundingClientRect(); return Math.round(r.left + r.width / 2); };
    const textMid = el => { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()]; const l = Math.min(...rs.map(x => x.left)), rt = Math.max(...rs.map(x => x.right)); return Math.round((l + rt) / 2); };
    const h = document.querySelector('.act--programmes .sec-head');
    return { gal: mid(document.querySelector('.act--programmes .gal')), heading: textMid(h.querySelector('.display')), script: textMid(h.querySelector('.script')), body: textMid(h.querySelector('.body')) };
  });
  console.log(w, JSON.stringify(m));
  await p.screenshot({ path: out + `prog-${w}.png` });
  await p.close();
}
await b.close();
