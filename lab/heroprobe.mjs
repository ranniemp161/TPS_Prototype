import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const out = {};
for (const [tag, file] of [['v1','v1.html'],['ruined','v1-ruined.html']]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1200);
  out[tag] = await p.evaluate(() => {
    const g = s => { const e=document.querySelector(s); if(!e) return 'absent'; const r=e.getBoundingClientRect();
      const c=getComputedStyle(e);
      return `top ${Math.round(r.top)} h ${Math.round(r.height)} pad ${c.paddingTop}/${c.paddingBottom} mt ${c.marginTop}`; };
    return { stage:g('.act--hero .stage'), media:g('.act--hero .stage__media'),
             copy:g('.act--hero .stage__copy'), h1:g('.act--hero .display'),
             script:g('.act--hero .script'), lede:g('.act--hero .lede'), btn:g('.act--hero .btn--primary') };
  });
  await p.close();
}
for (const k of Object.keys(out.v1)) {
  const same = out.v1[k] === out.ruined[k];
  console.log(`  ${k.padEnd(7)} ${same ? 'same ' : 'DIFF '} v1: ${out.v1[k]}`);
  if (!same) console.log(`  ${''.padEnd(7)}       rn: ${out.ruined[k]}`);
}
await b.close();
