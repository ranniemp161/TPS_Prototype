/* Tailored For You lead on phones: each line's width against the card's room, at several widths.
   node lab/ty-lead-measure.mjs [px]  (px forces a size, to measure in ems) */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [360, 390, 430, 768, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(900);
  if (process.argv[2]) await p.addStyleTag({ content: `.ty__lead{--ty-lead-fs:${process.argv[2]}px}` });
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const l = document.querySelector('.ty__lead'), c = document.querySelector('.ty__card'), cs = getComputedStyle(c);
    const room = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const wOf = e => { const r = document.createRange(); r.selectNodeContents(e); return Math.round(r.getBoundingClientRect().width * 10) / 10; };
    return { fs: getComputedStyle(l).fontSize, room: Math.round(room), a: wOf(l.querySelector('.ty__lead-a')), b: wOf(l.querySelector('.ty__lead-b')), text: l.innerText.replace(/\n/g, ' / '), h: Math.round(l.getBoundingClientRect().height) };
  })));
  await p.close();
}
await b.close();
