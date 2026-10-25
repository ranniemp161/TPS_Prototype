/* Picks Second baby and reads the capture form's child field. node lab/child-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.click('.dk-next'); await p.waitForTimeout(1000);
await p.click('label:has(#dkd-child-2)'); await p.waitForTimeout(400);
await p.click('input[name="days"][value="14"]', { force: true }); await p.waitForTimeout(400);
console.log('child field:', await p.evaluate(() => document.querySelector('[data-capture]').elements.child.value),
  '| radio checked:', await p.evaluate(() => document.querySelector('#dkd-child-2').checked));
await b.close();
