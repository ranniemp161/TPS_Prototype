// Four Kinds of Care: Read more centres the text; the button never moves (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  for (let k = 0; k < 4; k++) {
    await p.evaluate(k => { const s = document.querySelector('[data-hd]'); const top = s.getBoundingClientRect().top + scrollY; const rv = parseFloat(document.querySelector('[data-flight]').dataset.revealVh) || 0; window.scrollTo(0, top + (rv + (2 * k + 0.5) * 0.7) * innerHeight); }, k);
    await p.waitForTimeout(1800);
    const btn = () => p.evaluate(k => { const r = document.querySelectorAll('[data-hd-read]')[k].getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top); }, k);
    const b0 = await btn();
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(1000);
    const b1 = await btn();
    const m = await p.evaluate(k => {
      const kd = document.querySelectorAll('[data-hd-kind]')[k];
      const c = r => Math.round(r.left + r.width / 2);
      const lines = [...kd.querySelectorAll('.hd__name .hd-line, .hd__promise .hd-line')].map(l => c(l.getBoundingClientRect()));
      const f = kd.querySelector('.hd__full').getBoundingClientRect();
      return { lines, full: c(f), fullBottom: Math.round(f.bottom), vh: innerHeight, mid: Math.round(innerWidth / 2) };
    }, k);
    await p.screenshot({ path: out + `c${w}-k${k}-open.png` });
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(1000);
    const b2 = await btn();
    console.log(w, 'k' + k, 'button', b0, b1, b2, JSON.stringify(m));
  }
  await p.close();
}
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
for (let k = 0; k < 4; k++) {
  await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k); await p.waitForTimeout(600);
  console.log('390 k' + k, JSON.stringify(await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; return { fit: kd.style.getPropertyValue('--fit'), over: kd.scrollHeight - kd.clientHeight, para: getComputedStyle(kd.querySelector('.hd__para')).fontSize }; }, k)));
  await p.screenshot({ path: out + `m-k${k}.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
