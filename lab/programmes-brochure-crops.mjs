/* Phone crops of the brochure sections (TJ, 26 Oct 2026). node lab/programmes-brochure-crops.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.screenshot({ path: 'lab/shots/b6/crop-390-top.png' });
console.log(await p.evaluate(() => { const r = document.createRange(); const out = {}; for (const s of ['.pg-lengths__title', '.pg-lengths__script']) { r.selectNodeContents(document.querySelector(s)); const rs = r.getClientRects(); out[s] = [rs.length, Math.round(r.getBoundingClientRect().width), getComputedStyle(document.querySelector(s)).fontSize]; } return out; }));
for (const s of ['.pg-same', '.pg-tablecard', '.pg-pricing']) await p.locator(s).screenshot({ path: `lab/shots/b6/crop-390${s.replace('.', '-')}.png` });
await b.close();
