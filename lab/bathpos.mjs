import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1600,900],[1904,945],[1440,820],[1280,670]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0, window.innerHeight*2.1); });
  await p.waitForTimeout(1400);
  const r = await p.evaluate(() => {
    const g = s => { const e=document.querySelector(s); const b=e.getBoundingClientRect();
      return { t:Math.round(b.top), b:Math.round(b.bottom), l:Math.round(b.left), r:Math.round(b.right) }; };
    return { lines:g('.bath__lines'), say:g('.bath__lines .say'), script:g('.bath__lines .script'),
             copy:g('.bath__copy'), bath:g('.bath'), img:g('.bath__img'), vh:window.innerHeight };
  });
  const pct = v => (v / r.vh * 100).toFixed(0) + '%';
  console.log(`  ${(w+'x'+h).padEnd(10)} lines ${r.lines.t} to ${r.lines.b}  (${pct(r.lines.t)} to ${pct(r.lines.b)} of the window)   say width ${r.say.r-r.say.l}px  bath box ${r.bath.t} to ${r.bath.b}  image ${r.img.t} to ${r.img.b}`);
  await p.close();
}
await b.close();
