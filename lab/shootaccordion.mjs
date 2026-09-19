import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1400, height: 1200 } });
await p.goto(pathToFileURL('lab/accordion-options.html').href);
await p.waitForTimeout(600);

// Full page, initial state (each accordion's default open panel)
await p.screenshot({ path: `${out}/full-initial.png`, fullPage: true });

// Click a middle panel in each group to prove interactivity, then shoot each stage
for (const group of ['a', 'b', 'c']) {
  const acc = `.acc[data-group="${group}"]`;
  const panel = await p.$(`${acc} .acc__panel[data-idx="2"]`);
  await panel.click();
  await p.waitForTimeout(600);
  const box = await p.$eval(acc, el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y - 40, width: r.width, height: r.height + 80 };
  });
  await p.screenshot({ path: `${out}/${group}-panel3-open.png`, clip: box });
}

await b.close();
