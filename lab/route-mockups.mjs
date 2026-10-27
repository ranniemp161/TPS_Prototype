/* Two mockups for TJ (14 Oct 2026), CSS injected over the live page, no files changed.
   A: words below the line, the foot fade strongest there.  B: frosted glass band the line sits on. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const A = `
.route__wash { height: 42% !important; background: linear-gradient(to top, rgba(243,239,236,.9) 0%, rgba(243,239,236,.82) 20%, rgba(243,239,236,.4) 42%, rgba(243,239,236,.12) 70%, rgba(243,239,236,0) 100%) !important; }
.route { bottom: calc(14svh - var(--below)); }

.route { --below: 110px; }
.route__more { position: absolute; top: 100%; margin-top: 32px; left: 0; width: max-content; max-width: min(44ch, 56vw); }
.route__stop.is-left .route__more { left: auto; right: 0; }
`;
const B = `
.route__wash { height: 12svh !important; background: rgba(243,239,236,.62) !important; -webkit-backdrop-filter: blur(14px) saturate(1.2); backdrop-filter: blur(14px) saturate(1.2); }
.route { bottom: calc(12svh - var(--below)); }

.route { --below: 110px; }
.route__more { position: absolute; top: 100%; margin-top: 32px; left: 0; width: max-content; max-width: min(44ch, 56vw); }
.route__stop.is-left .route__more { left: auto; right: 0; }
`;
const b = await chromium.launch({ channel: 'chrome' });
for (const [tag, css] of [['A-below-fade', A], ['B-glass-band', B]]) {
  const p = await b.newPage({ viewport: { width: 1864, height: 984 } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2200);
  await p.addStyleTag({ content: css });
  const top = await p.evaluate(() => document.querySelector('[data-flight]').getBoundingClientRect().top + scrollY);
  const end = await p.evaluate(() => { const s = document.querySelector('[data-flight]'); return s.getBoundingClientRect().bottom + scrollY - innerHeight; });
  const want = [4.2, 8.6, 13.4]; let k = 0;
  for (let y = top - 1200; y <= end && k < want.length; y += 30) {
    await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(110);
    const t = await p.evaluate(() => document.querySelector('[data-video]').currentTime);
    if (t >= want[k]) { await p.waitForTimeout(700); await p.screenshot({ path: `lab/flight-frames/mock-${tag}-${k}.png` }); k++; }
  }
  await p.close();
}
await b.close();
console.log('done');
