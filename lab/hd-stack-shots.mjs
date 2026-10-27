// Four Kinds of Care: the stack (21 Oct 2026). Read more never moves; the
// open stack is centred and inside the window; the teaser is clamped with
// Read more on its last line; phones fit one screen.
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
    const closed = await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; const t = kd.querySelector('.hd__teaser').getBoundingClientRect(); const rb = kd.querySelector('[data-hd-read]'); const r = rb.getBoundingClientRect(); return { teaserBottom: Math.round(t.bottom), readVisible: r.bottom <= t.bottom + 1 && r.height > 0, clamp: kd.style.getPropertyValue('--hd-clamp'), label: rb.textContent }; }, k);
    await p.screenshot({ path: out + `s${w}-k${k}-closed.png` });
    const b0 = await btn();
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(1000);
    const b1 = await btn();
    const open = await p.evaluate(k => {
      const kd = document.querySelectorAll('[data-hd-kind]')[k];
      const c = r => Math.round(r.left + r.width / 2);
      const lines = [...kd.querySelectorAll('.hd__name .hd-line')].map(l => c(l.getBoundingClientRect()));
      const t = kd.querySelector('.hd__text').getBoundingClientRect();
      const sizes = new Set([...kd.querySelectorAll('.hd__promise, .hd__para p, .hd__sub, .hd__more p, [data-hd-read]')].map(e => getComputedStyle(e).fontSize));
      return { lines, textCentre: c(t), textBottom: Math.round(t.bottom), vh: innerHeight, mid: Math.round(innerWidth / 2), width: kd.style.getPropertyValue('--hd-w'), sizes: [...sizes], label: kd.querySelector('[data-hd-read]').textContent };
    }, k);
    await p.screenshot({ path: out + `s${w}-k${k}-open.png` });
    await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k);
    await p.waitForTimeout(1000);
    const b2 = await btn();
    console.log(w, 'k' + k, 'button', b0, b1, b2, 'closed', JSON.stringify(closed), 'open', JSON.stringify(open));
  }
  console.log(w, 'rail present:', await p.evaluate(() => !!document.querySelector('.hd__rail')));
  await p.close();
}
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on('pageerror', e => errs.push('390 ' + e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
for (let k = 0; k < 4; k++) {
  await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; window.scrollBy(0, kd.getBoundingClientRect().top - 200); }, k);
  await p.waitForTimeout(900);
  await p.screenshot({ path: out + `m-k${k}-closed.png` });
  await p.evaluate(k => document.querySelectorAll('[data-hd-read]')[k].click(), k); await p.waitForTimeout(600);
  console.log('390 k' + k, JSON.stringify(await p.evaluate(k => { const kd = document.querySelectorAll('[data-hd-kind]')[k]; return { fit: kd.style.getPropertyValue('--fit'), over: kd.scrollHeight - kd.clientHeight, para: getComputedStyle(kd.querySelector('.hd__para')).fontSize }; }, k)));
  await p.screenshot({ path: out + `m-k${k}-open.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
