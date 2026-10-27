/* Tailored For You on a phone: where it begins, the section above in view. node lab/ty-top-shot.mjs <outfile> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const top = await p.evaluate(() => document.querySelector('[data-ty]').getBoundingClientRect().top + scrollY);
for (const dy of [-700, -500, -300, -100]) { await p.evaluate(y => scrollTo(0, y), top + dy); await p.waitForTimeout(250); }
await p.waitForTimeout(1000);
await p.screenshot({ path: process.argv[2] });
console.log(await p.evaluate(() => { const s = document.querySelector('[data-ty]').getBoundingClientRect(), f = document.querySelector('[data-ty] .ty__photo').getBoundingClientRect(); return JSON.stringify({ sectionTop: Math.round(s.top), photo: [Math.round(f.top), Math.round(f.left), Math.round(innerWidth - f.right)], clip: getComputedStyle(document.querySelector('[data-ty] .ty__photo')).clipPath }); }));
await b.close();
