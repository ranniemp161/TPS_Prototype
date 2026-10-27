/* Tailored phones: where a tap on a day leaves the page, sampled over time. node lab/ty-seek-probe.mjs 14 */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const top = await p.evaluate(() => document.querySelector('[data-ty] .ty__days').getBoundingClientRect().top + scrollY);
await p.evaluate(y => scrollTo(0, y), top - 0.9 * 844); await p.waitForTimeout(600);
await p.tap(`[data-ty] .ty__day[data-days="${process.argv[2]}"]`);
for (let i = 0; i < 12; i++) { await p.waitForTimeout(250); console.log(i * 250 + 250, await p.evaluate(() => JSON.stringify({ y: Math.round(scrollY), daysTop: Math.round(document.querySelector('[data-ty] .ty__days').getBoundingClientRect().top), sel: (+getComputedStyle(document.querySelector('[data-ty] .ty__track')).getPropertyValue('--sel')).toFixed(2), docH: document.documentElement.scrollHeight }))); }
await b.close();
