// Four kinds of care on home against the footer: ground, field strength (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const f = s => { const e = document.querySelector(s); const c = getComputedStyle(e); return { bg: c.backgroundColor, op: c.opacity, blur: c.filter, mask: (c.maskImage || c.webkitMaskImage).slice(0, 50), anim: c.animationName + ' ' + c.animationDuration }; };
    const fa = s => { const c = getComputedStyle(document.querySelector(s), '::after'); return c.animationName + ' ' + c.animationDuration; };
    return { care: f('.act--care'), careField: f('.aurora--silk .aurora__field'), careAfter: fa('.aurora--silk .aurora__field'), foot: f('.sf'), footField: f('.sf__field'), footAfter: fa('.sf__field') };
  });
  console.log(w, JSON.stringify(info));
  for (const [sel, name] of [['.act--care', 'care'], ['.sf', 'footer']]) {
    const y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
    let at = await p.evaluate(() => scrollY);
    while (at < y) { await p.mouse.wheel(0, 400); at += 400; await p.waitForTimeout(80); }
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, `${TAG}-${name}-${w}.png`) });
  }
  console.log(errs);
  await p.close();
}
await b.close();
