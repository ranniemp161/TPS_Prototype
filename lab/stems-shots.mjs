import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
async function run(w,h,targets,prefix){
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const top = await p.evaluate(() => document.querySelector('[data-flight]').getBoundingClientRect().top + scrollY);
  const end = await p.evaluate(() => { const s = document.querySelector('[data-flight]'); return s.getBoundingClientRect().bottom + scrollY - innerHeight; });
  let ti=0;
  for (let y = top - 1200; y <= end && ti<targets.length; y += 40) {
    await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(120);
    const t = await p.evaluate(() => document.querySelector('[data-video]').currentTime);
    if (t >= targets[ti]) { await p.waitForTimeout(500); await p.screenshot({ path: `lab/flight-frames/${prefix}-${targets[ti]}.png` }); const m = await p.evaluate(()=>{const r=e=>{const q=document.querySelector(e);if(!q)return null;const x=q.getBoundingClientRect();return [x.top|0,x.bottom|0,x.left|0,x.right|0]};return {t:document.querySelector('[data-video]').currentTime,line:r('.route__line'),text:r('.is-current .route__text'),name:r('.is-current .route__name'),hdr:r('header')}}); console.log(prefix, targets[ti], JSON.stringify(m)); ti++; }
  }
  await p.close();
}

await run(390,844,[7.4],'stems-m');
await b.close();
