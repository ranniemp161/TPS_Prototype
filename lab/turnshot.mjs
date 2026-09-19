import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w,h] of [[1600,900],[1280,670],[900,800],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
    const a=document.querySelector('.act--turn');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 20); });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const g=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect();
      return {t:Math.round(b.top),b:Math.round(b.bottom),l:Math.round(b.left),r:Math.round(b.right),
              op:+getComputedStyle(e).opacity};};
    const cs = s => getComputedStyle(document.querySelector(s));
    const para = document.querySelector('.turn__lead .body');
    return { act:g('.act--turn'), lead:g('.turn__lead'), trail:g('.turn__trail'),
             h:g('.turn__line'), p1:g('.turn__lead .body'), p2:g('.turn__claim'),
             cols: cs('.turn').gridTemplateColumns,
             p1ch: Math.round(para.getBoundingClientRect().width / parseFloat(cs('.turn__lead .body').fontSize) * 2) };
  });
  const side = r.p2.l > r.p1.r - 5;
  console.log(`  ${(w+'x'+h).padEnd(10)} act ${r.act.b-r.act.t}px  ${side?'two columns':'stacked'}  claim ${r.p2.l>r.p1.r-5?'right':'below'}  p1 top ${r.p1.t} claim top ${r.p2.t}  opacity ${r.lead.op}  errors ${errs.length?errs.join('|'):'none'}`);
  await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  await p.close();
}
await b.close();
