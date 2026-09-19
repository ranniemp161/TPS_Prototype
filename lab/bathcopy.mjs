/* The bath line moved onto the right of the frame, over a photograph. Two
   things to check that a screenshot alone will not tell you: whether the
   copy still animates as one, and what contrast the ink actually meets
   against the water and steam it now sits on.
     node lab/bathcopy.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const lum = ([r,g,bl]) => { const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};
  return .2126*f(r)+.7152*f(g)+.0722*f(bl); };
const ratio=(a,c)=>{const [x,y]=[lum(a),lum(c)].sort((m,n)=>n-m);return (x+.05)/(y+.05);};

for (const [w, h] of [[1600,900],[1904,945],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  let worstSay = 99, worstScript = 99, at = '';
  for (let i = 0; i <= 8; i++) {
    const v = 1.40 + (1.80 - 1.40) * i / 8;   // only while the scene is at rest
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(600);
    const boxes = await p.evaluate(() => {
      const g = s => { const e = document.querySelector(s); const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
                 op: +getComputedStyle(document.querySelector('[data-bath-line]')).opacity }; };
      return { say: g('.bath__lines .say'), script: g('.bath__lines .script') };
    });
    if (boxes.say.op < 0.9) continue;
    await p.addStyleTag({ content: '.bath__lines { color: transparent !important; } .bath__lines * { color: transparent !important; }' });
    await p.waitForTimeout(120);
    for (const [k, box] of Object.entries(boxes)) {
      if (box.y < 0 || box.y + box.h > h || box.w < 5) continue;
      const buf = await p.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
      const px = await p.evaluate(async b64 => {
        const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
        const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
        const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0);
        const d=ctx.getImageData(0,0,cv.width,cv.height).data; const out=[];
        for(let i=0;i<d.length;i+=4) out.push([d[i],d[i+1],d[i+2]]);
        return out;
      }, buf.toString('base64'));
      const sorted = px.map(q=>({q,L:.2126*q[0]+.7152*q[1]+.0722*q[2]})).sort((a,c)=>a.L-c.L);
      const dark = sorted[Math.floor(sorted.length*.10)].q;
      const ink = k === 'say' ? [10,10,10] : [140,54,47];   // ink, and Ember Deep
      const r = ratio(ink, dark);
      if (k === 'say' && r < worstSay) { worstSay = r; at = v.toFixed(2); }
      if (k === 'script' && r < worstScript) worstScript = r;
    }
    await p.evaluate(() => { const t=[...document.querySelectorAll('style')].pop(); if(t) t.remove(); });
  }
  await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), 2.1);
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  console.log(`  ${(w+'x'+h).padEnd(10)} display line ${worstSay.toFixed(2)} : 1 (worst at ${at}vh)   handwriting ${worstScript.toFixed(2)} : 1   errors: ${errs.length?errs.join('|'):'none'}`);
  await p.close();
}
console.log('\nlarge text needs 3.0 : 1, body text needs 4.5 : 1');
await b.close();
