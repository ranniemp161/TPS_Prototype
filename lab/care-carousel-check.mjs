/* The care carousel: arrows, a name on the line, keys; shots of each card,
   the testimonials and the call to action. node lab/care-carousel-check.mjs <outdir> [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const cur = () => p.evaluate(() => {
  const c = document.querySelector('.care__card.is-current');
  return c ? c.querySelector('.card__title').textContent.trim() : 'none';
});
const sec = '.act--care';
await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start' }), sec); await p.waitForTimeout(1500);
console.log('start:', await cur());
const tops = [];
for (let i = 0; i < 4; i++) {
  await p.locator(sec).screenshot({ path: `${out}/care-${w}-${i}.png` });
  tops.push(await p.evaluate(() => Math.round(document.querySelector('[data-care-next]').getBoundingClientRect().top)));
  await p.click('[data-care-next]'); await p.waitForTimeout(700);
  console.log('after next:', await cur());
}
await p.click('[data-care-prev]'); await p.waitForTimeout(700); console.log('after prev:', await cur());
await p.click('.act--care .tv2__stop >> text=Meals'); await p.waitForTimeout(700); console.log('after tapping Meals on the line:', await cur());
await p.focus('[data-care-next]'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700); console.log('after right arrow key:', await cur());
console.log('next arrow top per card (should not change):', tops.join(' '));
for (const [s, n] of [['.act--voices', 'voices'], ['.act--cta', 'cta']]) {
  await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start' }), s); await p.waitForTimeout(1500);
  await p.locator(s).screenshot({ path: `${out}/${n}-${w}.png` });
}
console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), '| errors', JSON.stringify(errs));
await b.close();
