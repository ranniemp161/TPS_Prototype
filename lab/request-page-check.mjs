/* The Request a place page: empty, a bad postcode, an outside postcode, then a
   good one; and screenshots. node lab/request-page-check.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/request-a-place.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.screenshot({ path: `lab/shots/b6/request-page-${w}.png`, fullPage: true });
const msg = () => p.evaluate(() => document.querySelector('[data-request-msg]').textContent.slice(0, 80));
const send = async () => { await p.click('.rq-btn'); await p.waitForTimeout(3500); };
await send(); console.log('empty:', await msg());
await p.fill('#rq-first', 'Test'); await p.fill('#rq-last', 'Mother'); await p.fill('#rq-email', 'test@example.com'); await p.fill('#rq-phone', '07700 900123'); await p.fill('#rq-due', '2027-03');
await p.check('input[name="child"][value="second"]'); await send(); console.log('no privacy tick:', await msg());
await p.check('#rq-privacy');
await p.fill('#rq-area', 'nope'); await send(); console.log('bad postcode:', await msg());
await p.fill('#rq-area', 'M1'); await send(); console.log('Manchester:', await msg());
await p.fill('#rq-area', 'sw7'); await send();
console.log('London SW7:', await p.evaluate(() => `form shown ${!document.querySelector('[data-request]').hidden}, confirmation shown ${!document.querySelector('[data-request-done]').hidden}, "${document.querySelector('.rq-done__h').textContent}"`));
await p.waitForTimeout(1200); await p.screenshot({ path: `lab/shots/b6/request-done-${w}.png` });
console.log('area kept as:', await p.evaluate(() => document.querySelector('#rq-area').value));
console.log('header button:', await p.evaluate(() => { const a = document.querySelector('.tab--cta'); return a.textContent + ' -> ' + a.getAttribute('href'); }), '| errors', JSON.stringify(errs));
await b.close();
