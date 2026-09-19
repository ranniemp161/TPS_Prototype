/* Both of TJ's screenshots end in #programmes. Where does that hash actually
   put you, in the baseline versus the current build? The anchor is resolved
   by the browser before ScrollTrigger builds its pins, so the landing point
   depends on how long the document is BEFORE pinning, which is exactly what
   adding a section changed.
     node lab/hashland.mjs <w> <h> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const OUT = "C:/Users/LenoVo/AppData/Local/Temp/hashland";
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const W = +(process.argv[2] || 1904), H = +(process.argv[3] || 945);

for (const [tag, file] of [['baseline', 'lab/baseline/v1.html'], ['current', 'v1.html']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href + '#programmes', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const prog = document.getElementById('programmes').getBoundingClientRect();
    return { y: Math.round(window.scrollY), docH: Math.round(document.documentElement.scrollHeight),
             progTop: Math.round(prog.top + window.scrollY),
             pct: +(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100).toFixed(1) };
  });
  console.log(`${tag.padEnd(9)} lands at scrollY ${String(r.y).padStart(6)}  (${String(r.pct).padStart(5)}% of the page)   #programmes actually sits at ${r.progTop}   docH ${r.docH}`);
  await p.screenshot({ path: path.join(OUT, tag + '.png') });
  await p.close();
}
await b.close();
