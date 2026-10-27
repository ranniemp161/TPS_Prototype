import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
async function walk(w,h,tag,stops){
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForTimeout(1300);
  for (let k=0;k<20;k++){ const n=await p.evaluate(()=>document.querySelector('[data-step-name]').textContent);
   if(n==='Due date'){await p.evaluate(() => { const f = document.getElementById('due'); f.value = '2027-05-15'; f.dispatchEvent(new Event('input', { bubbles: true })); });await p.waitForTimeout(500);if(stops.due)await p.screenshot({path:`lab/funnel/hcentre-due${tag}.png`});}
   if(n==='Meals'&&stops.step)await p.screenshot({path:`lab/funnel/hcentre-step${tag}.png`});
   if(n==='Your programme'&&await p.$('[data-section="builder-decide"]:not([aria-hidden="true"])')){if(!stops.close)break;await p.click('[data-not-yet]');await p.waitForTimeout(1200);await p.screenshot({path:`lab/funnel/hcentre-close${tag}.png`});await p.fill('#capture-email','a@b.com');await p.click('.capture__btn');await p.waitForTimeout(1200);await p.screenshot({path:`lab/funnel/hcentre-done${tag}.png`});break;}
   await p.click('[data-next]');await p.waitForTimeout(1100);}
  await p.close();
}
await walk(1865,905,'',{due:1,step:1,close:1});
await walk(390,844,'-390',{due:1});
await b.close();
