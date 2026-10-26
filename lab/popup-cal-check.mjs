/* The Check your dates due date pop-up: opens, moves months without the
   arrows shifting, picks a day, closes, shows the date, and the form sends.
   node lab/popup-cal-check.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/request-a-place.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
const open = () => p.evaluate(() => !document.querySelector('[data-rq-cal]').hidden);
await p.click('#rq-due'); await p.waitForTimeout(300);
console.log('opened on click:', await open(), '| month:', await p.evaluate(() => document.querySelector('[data-rq-month]').textContent));
await p.evaluate(() => document.querySelector('[data-rq-cal]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
await p.screenshot({ path: `lab/shots/b6/popup-${w}.png` });
const arrow = () => p.evaluate(() => Math.round(document.querySelector('[data-rq-step="1"]').getBoundingClientRect().top));
const a0 = await arrow(); const tops = [];
for (let i = 0; i < 6; i++) { await p.click('[data-rq-step="1"]'); await p.waitForTimeout(150); tops.push(await arrow()); }
console.log('after 6 months forward:', await p.evaluate(() => document.querySelector('[data-rq-month]').textContent), '| arrow moved:', tops.some(t => t !== a0));
await p.click('[data-rq-grid] .due-day[data-date] >> nth=13'); await p.waitForTimeout(300);
console.log('after picking a day: open', await open(), '| field shows', JSON.stringify(await p.inputValue('#rq-due')), '| sent value', await p.evaluate(() => document.querySelector('[data-rq-due]').value));
await p.click('#rq-due'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
console.log('Escape closes:', !(await open()));
await p.click('#rq-due'); await p.waitForTimeout(200); await p.mouse.click(5, 300); await p.waitForTimeout(200);
console.log('click outside closes:', !(await open()));
await p.fill('#rq-first', 'Test'); await p.fill('#rq-last', 'Mother'); await p.fill('#rq-email', 'test@example.com'); await p.fill('#rq-phone', '07700 900123'); await p.fill('#rq-area', 'SW7');
await p.check('input[name="child"][value="first"]'); await p.check('#rq-privacy');
await p.click('.rq-btn'); await p.waitForTimeout(4000);
console.log('sent:', await p.evaluate(() => !document.querySelector('[data-request-done]').hidden), '| errors', JSON.stringify(errs));
await b.close();
