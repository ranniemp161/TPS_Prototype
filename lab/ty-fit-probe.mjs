/* Tailored desktop: the fit measurement itself, open and closed, without and with .is-tight. W H node lab/ty-fit-probe.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const W = +(process.env.W || 1440), H = +(process.env.H || 900);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href, { timeout: 60000 });
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => {
  const sec = document.querySelector('[data-ty]'), card = sec.querySelector('.ty__card'), panel = sec.querySelector('[data-tl-readmore]');
  sec.classList.remove('is-calm'); const res = { built: document.querySelector('[data-ty]').className };
  for (const tight of [false, true]) {
    sec.classList.toggle('is-tight', tight); sec.classList.add('ty-measure');
    for (const open of [false, true]) {
      panel.classList.toggle('is-open', open); sec.classList.toggle('is-wide', open);
      const kids = [...card.children], cs = getComputedStyle(card);
      const top = Math.min(...kids.map(k => k.getBoundingClientRect().top)), bot = Math.max(...kids.map(k => k.getBoundingClientRect().bottom));
      res[(tight ? 'tight ' : 'plain ') + (open ? 'open' : 'closed')] = { need: Math.round(bot - top + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)), room: card.clientHeight, g: getComputedStyle(sec).getPropertyValue('--ty-g').trim(), kids: kids.map(k => k.className + ':' + Math.round(k.getBoundingClientRect().height)).join(' ') };
    }
    panel.classList.remove('is-open'); sec.classList.remove('is-wide'); sec.classList.remove('ty-measure');
  }
  return res;
}), null, 1));
await b.close();
