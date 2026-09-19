import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
let bad = 0;
for (const [w,h] of [[1920,1080],[1600,900],[1440,820],[1280,670],[1097,545],[900,800],[390,844],[360,740]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
    const a=document.querySelector('.act--turn');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY); });   // section flush at the top
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const nav=document.querySelector('.nav__inner').getBoundingClientRect();
    const hd=document.querySelector('.turn__line').getBoundingClientRect();
    const cs=getComputedStyle(document.querySelector('.turn__line'));
    return { navB:Math.round(nav.bottom), hT:Math.round(hd.top), hB:Math.round(hd.bottom),
             size:Math.round(parseFloat(cs.fontSize)), centred: cs.textAlign };
  });
  const gap = r.hT - r.navB;
  const issue = gap < 16 ? `only ${gap}px under the nav` : '';
  if (issue) bad++;
  console.log(`  ${(w+'x'+h).padEnd(10)} heading ${r.size}px, ${r.centred}, ${gap}px clear of the nav  ${issue||'ok'}`);
  await p.close();
}
console.log(bad ? `\n${bad} size(s) tight.` : '\nHeading clears the nav at every size.');
await b.close();
