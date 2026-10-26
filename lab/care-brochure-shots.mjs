import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h] of [[1440,900],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('#care').scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
  const n = await p.locator('[data-care-card]').count();
  for (let i = 0; i < n; i++) {
    const r = await p.evaluate(() => { const c=document.querySelector('.care__card.is-current'); const cr=c.getBoundingClientRect(); let o=0; c.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width&&(r.right>cr.right+1||r.left<cr.left-1)) o++;}); return {t:c.querySelector('.card__title').textContent, over:o, h:Math.round(cr.height), sw:c.scrollWidth-c.clientWidth}; });
    console.log(w, JSON.stringify(r));
    if (i===0 || i===3) await p.locator('#care').screenshot({ path: `lab/shots/b6/care-brochure-${w}${i?'-last':''}.png` });
    await p.click('[data-care-next]'); await p.waitForTimeout(700);
  }
  console.log('doc overflow', await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
  await p.close();
}
await b.close();
