import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [tag,file] of [['v1 now','v1.html'],['night act as it was','lab/baseline/v1.html']]) {
  for (const [w,h] of [[1600,900],[390,844]]) {
    const p = await b.newPage({ viewport:{width:w,height:h} });
    await p.goto(pathToFileURL(path.join(ROOT,file)).href, { waitUntil:'load' });
    await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const m=document.querySelector('.nightframe__media'); if(!m) return null;
      const b=m.getBoundingClientRect();
      return { w: Math.round(b.width), l: Math.round(b.left) }; });
    console.log(`  ${tag.padEnd(22)} ${(w+'x'+h).padEnd(9)} frame ${r? r.w+'px wide, starting at '+r.l : 'absent'}`);
    await p.close();
  }
}
await b.close();
