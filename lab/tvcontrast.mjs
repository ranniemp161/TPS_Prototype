import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(800);
// hide every mark the block draws, so the sample is the ground alone
await p.addStyleTag({ content: '.tv2 * { color: transparent !important; } .tv2 img, .tv2__rule, .tv2__fill, .tv2__bar, .tv2__cursor { visibility: hidden !important; }' });
const lum = ([r,g,bl]) => { const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};
  return .2126*f(r)+.7152*f(g)+.0722*f(bl); };
const ratio=(a,c)=>{const [x,y]=[lum(a),lum(c)].sort((m,n)=>n-m);return (x+.05)/(y+.05);};
let worstInk=99, worstMute=99, at='';
for (let i=0;i<=12;i++){
  const v = 1.9 + (3.8-1.9)*i/12;
  await p.evaluate(y=>window.scrollTo(0,window.innerHeight*y), v);
  await p.waitForTimeout(500);
  const box = await p.locator('.tv2').boundingBox();
  const clip = { x: Math.max(0,box.x), y: Math.max(0,box.y), width: box.width, height: Math.min(box.height, 900-Math.max(0,box.y)) };
  if (clip.height < 20) continue;
  const buf = await p.screenshot({ clip });
  const px = await p.evaluate(async b64 => {
    const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
    const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height;
    const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0);
    const d=ctx.getImageData(0,0,cv.width,cv.height).data; const out=[];
    for(let i=0;i<d.length;i+=4) out.push([d[i],d[i+1],d[i+2]]);
    return out;
  }, buf.toString('base64'));
  const sorted = px.map(q=>({q,L:.2126*q[0]+.7152*q[1]+.0722*q[2]})).sort((a,c)=>a.L-c.L);
  const dark = sorted[Math.floor(sorted.length*.05)].q;   // 5th percentile: the darkest ground text sits on
  const ri = ratio([10,10,10], dark), rm = ratio([115,115,115], dark);
  if (ri<worstInk){worstInk=ri; at=v.toFixed(2);}
  if (rm<worstMute) worstMute=rm;
}
console.log(`\nquote and names, Ink #0A0A0A on the field   worst ${worstInk.toFixed(2)} : 1  (at ${at}vh)`);
console.log(`programme line and hint, #737373 on the field   worst ${worstMute.toFixed(2)} : 1`);
console.log('body text needs 4.5 : 1');
await b.close();
