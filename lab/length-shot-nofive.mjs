import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h] of [[1440,900],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.locator('.due-day:not(.due-day--pad)').nth(27).click().catch(()=>{});
  for (let i=0;i<6;i++){ const vis = await p.evaluate(()=>{const g=document.querySelector('[aria-label="How long"]');const r=g.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>0}); if(vis)break; await p.evaluate(()=>document.querySelector('[data-next]').click()); await p.waitForTimeout(900);}
  await p.evaluate(() => { const g=document.querySelector('[aria-label="How long"]'); g.scrollIntoView({inline:'start',block:'center'}); });
  await p.waitForTimeout(1200);
  const n = await p.evaluate(() => [...document.querySelectorAll('[aria-label="How long"] input')].map(i=>i.value+(i.checked?'*':'')).join(' '));
  console.log(w, n);
  await p.screenshot({ path: `${out}/length-${w}.png` });
  await p.close();
}
await b.close();
