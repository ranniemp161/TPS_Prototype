import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const el = await p.$('.act--treatments-b');
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(700);

let box = await p.evaluate(() => {
  const r = document.querySelector('.act--treatments-b').getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.top), width: 1600, height: Math.min(1000, r.height) };
});
await p.screenshot({ path: `${out}/initial.png`, clip: box });

// click panel 3 (belly binding)
await p.click('[data-tb-panel="3"]');
await p.waitForTimeout(700);
box = await p.evaluate(() => {
  const r = document.querySelector('.act--treatments-b').getBoundingClientRect();
  return { x: 0, y: Math.max(0, r.top), width: 1600, height: Math.min(1000, r.height) };
});
await p.screenshot({ path: `${out}/panel3-open.png`, clip: box });

// mobile width check
await p.setViewportSize({ width: 390, height: 900 });
await p.waitForTimeout(400);
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/mobile-closed.png` });
await p.click('[data-tb-panel="1"]');
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}/mobile-open.png` });

await b.close();
