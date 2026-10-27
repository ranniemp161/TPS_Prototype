/* Look at a hosted page: title, text outline and screenshots. node lab/ref-look.mjs <url> <outdir> */
import { chromium } from 'playwright-core';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  if (w === 1440) {
    const info = await p.evaluate(() => ({ title: document.title, text: document.body.innerText.slice(0, 3000), scripts: [...document.scripts].map(s => s.src || 'inline').slice(0, 10) }));
    console.log(JSON.stringify(info, null, 1));
  }
  await p.screenshot({ path: `${out}/ref-${w}.png` });
  await p.close();
}
await b.close();
