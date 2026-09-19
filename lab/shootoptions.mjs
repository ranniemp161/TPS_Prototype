/* Screenshots each indicator option at several points through its scroll,
   so the proposals can be judged as pictures rather than description. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('lab/indicator-options.html').href);
await p.waitForTimeout(1800);

for (const name of ['words', 'answer', 'horizon']) {
  const top = await p.evaluate(k => {
    const d = document.querySelector(`[data-demo="${k}"]`);
    return d.getBoundingClientRect().top + scrollY;
  }, name);
  const span = await p.evaluate(k =>
    document.querySelector(`[data-demo="${k}"]`).offsetHeight - innerHeight, name);

  for (const f of [0, 0.35, 0.7, 1]) {
    await p.evaluate(y => scrollTo(0, y), top + span * f);
    await p.waitForTimeout(450);
    await p.screenshot({ path: `${out}/${name}-${String(Math.round(f * 100)).padStart(3, '0')}.png` });
  }
  console.log(name, 'captured');
}
await b.close();
