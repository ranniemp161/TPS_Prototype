import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/who-comes-into-your-home.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => {
  const f0 = document.querySelector('.spec__frame'); f0.style.height=''; f0.style.aspectRatio=''; const natural = f0.offsetHeight; const pts0=document.querySelectorAll('.wc-points li'); const l0=pts0[pts0.length-1]; const nat = { natural, lastTop: l0.offsetTop, lastH: l0.offsetHeight, ch: document.documentElement.clientHeight, ih: innerHeight, compat: document.compatMode, maxW: getComputedStyle(f0).maxWidth, w: f0.offsetWidth };
  const f = document.querySelector('.spec__frame'); const pts = document.querySelectorAll('.wc-points li'); const last = pts[pts.length-1];
  let y = 0, chain = []; for (let n = last; n; n = n.offsetParent) { y += n.offsetTop; chain.push(n.tagName + '.' + n.className + ':' + n.offsetTop); }
  return { nat, frameH: f.offsetHeight, styleH: f.style.height, docTopLast: y, rectBottom: last.getBoundingClientRect().bottom, chain };
})));
await b.close();
