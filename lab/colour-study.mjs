/* Accent colour study (TJ, 20 Oct 2026): the home bath scene and the Who Comes
   Into Your Home hero, rendered with the coral tier swapped for each palette.
   Only the four coral tokens change; canvas, blush, rose mist and ink stay.
   node lab/colour-study.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const P = {
  current:  ['#C86D58', '#B95A4B', '#A64C45', '#8C362F'],
  sage:     ['#8FA08A', '#74866F', '#5E6F5A', '#4A5947'],
  mulberry: ['#9A6676', '#84525F', '#6B3F4E', '#55303D'],
  clay:     ['#D0937E', '#C47F69', '#B8705A', '#995843'],
  ink:      ['#6F7E96', '#4F5F78', '#2F3E55', '#233044'],
  bronze:   ['#C2A57A', '#AE9063', '#9A7B4F', '#7D633D'],
  none:     ['#D7C2C9', '#C9B9B5', '#0A0A0A', '#2C2C2C']
};
const css = ([mid, deep, ember, emberDeep]) => `:root{--coral-mid:${mid}!important;--coral-deep:${deep}!important;--ember:${ember}!important;--ember-deep:${emberDeep}!important}`;
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const [name, pal] of Object.entries(P)) {
    // Home: walk to the frame where the figures and the line both show.
    let p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push(name + ' ' + e.message));
    await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href, { waitUntil: 'load' });
    await p.addStyleTag({ content: css(pal) });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    let found = false;
    for (let v = 0.8; v <= 4.5; v += 0.05) {
      await p.evaluate(y => window.scrollTo(0, innerHeight * y), v);
      await p.waitForTimeout(140);
      const ok = await p.evaluate(() => {
        const o = s => { const e = document.querySelector(s); return e ? +getComputedStyle(e).opacity : 0; };
        const f = document.querySelector('[data-bath-figures]'), l = document.querySelector('[data-bath-line]');
        if (!f || !l) return false;
        const fr = f.getBoundingClientRect(), lr = l.getBoundingClientRect();
        return o('[data-bath-figures]') > .95 && o('[data-bath-line]') > .95 && fr.top > 60 && lr.bottom < innerHeight;
      });
      if (ok) { found = true; break; }
    }
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${out}/home-${name}-${w}.jpg`, quality: 86 });
    if (!found) errs.push(`${name} ${w}: bath frame not found`);
    await p.close();
    // Who Comes Into Your Home hero at scroll zero.
    p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push(name + ' ' + e.message));
    await p.goto(pathToFileURL(process.cwd() + '/index/who-comes-into-your-home.html').href, { waitUntil: 'load' });
    await p.addStyleTag({ content: css(pal) });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
    await p.screenshot({ path: `${out}/who-${name}-${w}.jpg`, quality: 86 });
    await p.close();
  }
}
console.log('errors', JSON.stringify(errs));
await b.close();
