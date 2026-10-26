import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
for (const f of ['gifts', 'request-a-place']) {
  await p.goto(pathToFileURL(path.resolve(`index/${f}.html`)).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.screenshot({ path: `lab/shots/b6/bg-${f}-390.png` });
}
await b.close();
