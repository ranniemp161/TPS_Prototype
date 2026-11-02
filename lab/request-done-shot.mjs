// Fills and sends the Check your dates form, shoots before and after (Opus, 1 Nov 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'request-a-place.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(OUT, `rq-before-${w}.png`) });
  const f = p.locator('form[data-request]');
  await f.locator('input[name="first"], input[name="first_name"], input[name="firstname"]').first().fill('Test').catch(() => {});
  await f.locator('input[name="last"], input[name="last_name"], input[name="lastname"]').first().fill('Mother').catch(() => {});
  await f.locator('input[type="email"]').fill('test@example.com');
  await f.locator('input[type="tel"]').fill('7700900000').catch(() => {});
  await f.locator('input[name="postcode"]').fill('SW7');
  await p.click('#rq-due');
  await p.waitForTimeout(300);
  await p.click('#rq-cal .due-day:not([disabled]) >> nth=20'); await p.waitForTimeout(300); await p.keyboard.press('Escape');
  await p.locator('label:has(input[name="child"])').first().click().catch(() => {});
  await p.evaluate(() => { const c = document.getElementById('rq-privacy'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.locator('.rq-btn').click({ force: true });
  await p.waitForTimeout(2000);
  const r = await p.evaluate(() => ({
    done: !document.querySelector('[data-request-done]').hidden,
    card: getComputedStyle(document.querySelector('.rq-card')).display,
    lede: getComputedStyle(document.querySelector('.pg-lengths__head .pg-lengths__lede')).display,
    script: !!document.querySelector('.pg-lengths__script'),
    msg: document.querySelector('[data-request-msg]').textContent,
  }));
  console.log(w, JSON.stringify(r), errs.length ? errs : '');
  await p.screenshot({ path: path.join(OUT, `rq-after-${w}.png`) });
  await p.close();
}
await b.close();
