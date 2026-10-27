// What We Do: the fly through dissolves onto the Four Kinds of Care (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
  await p.mouse.move(w / 2, h / 2);
  for (const at of [-1.2, -1, -0.75, -0.5, -0.25, 0, 0.6, 1.6]) {
    await p.evaluate(at => { const s = window.__flight.state(); window.scrollTo(0, s.top + s.trackVh * s.vh + at * s.vh); }, at);
    await p.waitForTimeout(1500);
    const m = await p.evaluate(() => {
      const st = document.querySelector('[data-flight] .flight__stage'), hd = document.querySelector('[data-hd]');
      const k0 = document.querySelector('#hd-h0');
      return { reveal: document.querySelector('[data-flight]').classList.contains('is-reveal'), stageOp: getComputedStyle(st).opacity,
        hdTop: Math.round(hd.getBoundingClientRect().top), hdLive: hd.classList.contains('is-live'),
        name0: k0 ? Math.round(k0.getBoundingClientRect().top) : null, kind0: getComputedStyle(document.querySelector('[data-hd-kind]')).opacity };
    });
    console.log(w, at, JSON.stringify(m));
    await p.screenshot({ path: out + `rev-${w}-${String(at).replace('.', 'p')}.png` });
  }
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
