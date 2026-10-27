// What We Do, Four Kinds of Care: Read more (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  for (let k = 0; k < 4; k++) {
    await p.evaluate(k => { const s = document.querySelector('[data-hd]'); const top = s.getBoundingClientRect().top + scrollY; const rv = parseFloat(document.querySelector('[data-flight]').dataset.revealVh) || 0; window.scrollTo(0, top + (rv + (2 * k + 0.5) * 0.7) * innerHeight); }, k);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: out + `d${w}-k${k}-closed.png` });
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(900);
    const m = await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; const r = kd.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, on: kd.classList.contains('is-on') }; }, k);
    console.log(w, 'kind', k, JSON.stringify(m));
    await p.screenshot({ path: out + `d${w}-k${k}-open.png` });
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(500);
  }
  // open, then scroll on: it should close
  await p.evaluate(() => document.querySelectorAll('[data-hd-read]')[3].click());
  await p.evaluate(() => window.scrollBy(0, -innerHeight * 1.4)); await p.waitForTimeout(1500);
  console.log(w, 'after scroll, reading:', await p.evaluate(() => document.querySelector('[data-hd]').classList.contains('is-reading')));
  await p.close();
}
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on('pageerror', e => errs.push('390 ' + e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
for (let k = 0; k < 4; k++) {
  await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; window.scrollBy(0, kd.getBoundingClientRect().top - 200); }, k);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out + `m-k${k}-closed.png` });
  await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
  await p.waitForTimeout(700);
  const m = await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; const para = kd.querySelector('.hd__para'); return { fit: kd.style.getPropertyValue('--fit'), scroll: kd.scrollHeight, client: kd.clientHeight, paraPx: getComputedStyle(para).fontSize }; }, k);
  console.log('390 kind', k, JSON.stringify(m));
  await p.screenshot({ path: out + `m-k${k}-open.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
