// Mock-up only, no file change: the testimonials on the gifts page's ground
// and drift, everything else in the section unchanged (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const css = `
.voices { background: var(--reach-ground) !important; }
.aurora--voices .aurora__field {
  background-image: repeating-linear-gradient(100deg, transparent 0%, var(--g-tint) 7%, var(--rib-light) 12%, transparent 22%, var(--g-soft) 30%, transparent 40%) !important;
  background-size: 300% !important; background-position: 50% 50% !important;
  filter: blur(44px) !important; opacity: .8 !important;
  -webkit-mask-image: radial-gradient(ellipse 95% 80% at 70% 40%, #000 14%, rgba(0,0,0,.55) 64%, rgba(0,0,0,.22) 100%) !important;
  mask-image: radial-gradient(ellipse 95% 80% at 70% 40%, #000 14%, rgba(0,0,0,.55) 64%, rgba(0,0,0,.22) 100%) !important; }
.aurora--voices .aurora__field::after {
  background-image: repeating-linear-gradient(123deg, transparent 0%, var(--rib-light) 6%, var(--g-tint) 12%, transparent 24%, var(--g-haze) 33%, transparent 46%) !important;
  background-size: 235% !important; }`;
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const mock of [false, true]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
    if (mock) await p.addStyleTag({ content: css });
    const y = await p.evaluate(() => document.querySelector('.act--voices').getBoundingClientRect().top + scrollY - 160);
    let at = 0; while (at + 200 < y) { await p.mouse.wheel(0, 200); at += 200; await p.waitForTimeout(80); }
    await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(OUT, `testimonials-${mock ? 'gifts-mockup' : 'current'}-${w}.png`) });
    await p.close();
  }
}
await b.close();
