/* The confinement act is the most text heavy on the page and it now sits on
   a moving field. Hides the type, photographs the ground behind each block,
   and reads a percentile so one antialiased pixel cannot decide it.
     node lab/turncontrast.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const lum = ([r,g,bl]) => { const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};
  return .2126*f(r)+.7152*f(g)+.0722*f(bl); };
const ratio=(a,c)=>{const [x,y]=[lum(a),lum(c)].sort((m,n)=>n-m);return (x+.05)/(y+.05);};
const INK={heading:[10,10,10], body:[44,44,44], claim:[10,10,10]};
for (const [w,h] of [[1600,900],[390,844]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; });
  const worst = { heading:99, body:99, claim:99 };
  for (let i=0;i<=8;i++) {
    const top = await p.evaluate(() => document.querySelector('.act--turn').getBoundingClientRect().top + window.scrollY);
    await p.evaluate(y => window.scrollTo(0,y), top - h*0.15 + (h*0.9)*i/8);
    await p.waitForTimeout(420);
    const boxes = await p.evaluate(() => {
      // The nav is fixed and paints over anything that has scrolled under
      // it, so a raw bounding box that reaches up behind the bar reports
      // the Enquire button as the ground. Measured: that alone took the
      // heading from 14.28 to 3.53. Samples that touch the bar are dropped.
      const navB = document.querySelector('.nav__inner').getBoundingClientRect().bottom;
      const g=s=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect();
        if (r.top < navB + 2) return null;
        return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
      return { heading:g('.turn__line'), body:g('.turn__lead .body'), claim:g('.turn__claim') };
    });
    await p.addStyleTag({ content:'.act--turn, .act--turn * { color: transparent !important; }' });
    await p.waitForTimeout(110);
    for (const [k,box] of Object.entries(boxes)) {
      if (!box || box.y<0 || box.y+box.h>h || box.w<5) continue;
      const buf = await p.screenshot({ clip:{x:box.x,y:box.y,width:box.w,height:box.h} });
      const px = await p.evaluate(async b64 => {
        const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
        const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
        const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0);
        const d=ctx.getImageData(0,0,cv.width,cv.height).data; const out=[];
        for(let i=0;i<d.length;i+=4) out.push([d[i],d[i+1],d[i+2]]); return out;
      }, buf.toString('base64'));
      const sorted = px.map(q=>({q,L:.2126*q[0]+.7152*q[1]+.0722*q[2]})).sort((a,c)=>a.L-c.L);
      const dark = sorted[Math.floor(sorted.length*.10)].q;
      const r = ratio(INK[k], dark);
      if (r < worst[k]) worst[k] = r;
    }
    await p.evaluate(() => { const t=[...document.querySelectorAll('style')].pop(); if(t) t.remove(); });
  }
  console.log(`  ${(w+'x'+h).padEnd(10)} heading ${worst.heading.toFixed(2)}   paragraph ${worst.body.toFixed(2)}   the claim ${worst.claim.toFixed(2)}   (body needs 4.5)`);
  await p.close();
}
await b.close();
