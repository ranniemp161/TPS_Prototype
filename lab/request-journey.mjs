/* The builder's ending: Your programme, Request a place, the form, the list.
   node lab/request-journey.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);
const name = () => p.evaluate(() => document.querySelector('[data-step-name]').textContent.trim());
for (let i = 0; i < 12; i++) {
  const n = await name();
  if (/Your programme$/.test(n)) break;
  if (/Due date/.test(n)) { await p.click('[data-due-grid] button.due-day >> nth=14'); await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(300); }
  await p.click('.dk-next', { force: true }); await p.waitForTimeout(1100);
}
console.log('at:', await name(), '| button:', await p.evaluate(() => document.querySelector('.dk-decide__book').textContent));
await p.click('.dk-decide__book'); await p.waitForTimeout(1300);
console.log('after Request a place:', await name());
await p.screenshot({ path: `lab/shots/b6/request-${w}.png` });
await p.click('.capture__btn'); await p.waitForTimeout(600);
console.log('send with empty form, still at:', await name());
await p.fill('#cap-first', 'Test'); await p.fill('#cap-last', 'Mother'); await p.fill('#cap-email', 'test@example.com'); await p.fill('#cap-phone', '07700 900123'); await p.check('#cap-privacy');
await p.click('.capture__btn'); await p.waitForTimeout(1300);
console.log('after sending:', await name(), '|', await p.evaluate(() => document.querySelector('.dk-sum--done .dk-step__t').textContent));
const f = await p.evaluate(() => { const e = document.querySelector('[data-capture]').elements; return ['first_name', 'last_name', 'phone', 'postcode', 'due', 'child', 'fee', 'fee_per_day', 'days', 'format'].map(k => `${k}=${e[k].value}`).join(' '); });
console.log('form carried:', f);
console.log('call link:', await p.evaluate(() => document.querySelector('.dk-sum--done [data-calendly]').textContent + ' -> ' + document.querySelector('.dk-sum--done [data-calendly]').href.slice(0, 60)));
await p.screenshot({ path: `lab/shots/b6/done-${w}.png` });
const decide = await p.evaluate(() => document.body.innerText.includes('Not yet'));
console.log('"Not yet" anywhere on the page:', decide, '| errors', JSON.stringify(errs));
await b.close();
