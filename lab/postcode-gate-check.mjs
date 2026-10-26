/* The opening screen's postcode gate. node lab/postcode-gate-check.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const st = async (label) => console.log(label.padEnd(34), await p.evaluate(() => `${document.querySelector('[data-step-name]').textContent.trim().padEnd(18)} message: "${document.querySelector('[data-pc-msg]').textContent.slice(0, 70)}"`));
await p.click('.dk-next'); await p.waitForTimeout(800); await st('Begin with no postcode');
await p.fill('#pc', 'hello'); await p.click('.dk-next'); await p.waitForTimeout(1200); await st('Begin with "hello"');
await p.fill('#pc', 'M1'); await p.click('.dk-next'); await p.waitForTimeout(4000); await st('Begin with M1 1AE (Manchester area)');
await p.mouse.wheel(600, 0); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1200); await st('  then trying to move on anyway');
await p.fill('#pc', 'EN6 1AA'); await p.click('.dk-next'); await p.waitForTimeout(4000); await st('Begin with EN6 1AA (full, on the edge)');
await p.fill('#pc', 'sw7'); await p.click('.dk-next'); await p.waitForTimeout(4000); await st('Begin with sw1a1aa (Kensington area)');
console.log('postcode carried to the form:', await p.evaluate(() => document.querySelector('[data-capture]').elements.postcode.value), '| errors', JSON.stringify(errs));
await p.screenshot({ path: 'lab/shots/b5/after-postcode.png' });
await b.close();
