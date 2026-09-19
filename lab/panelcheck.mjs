/* Proves three things about the dev panel: it does not change the document,
   it reports the right section, and it renders. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const url = pathToFileURL('v1.html').href;
const b = await chromium.launch({ channel: 'chrome' });

const measure = async suffix => {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto(url + suffix);
  await p.waitForLoadState('load');
  await p.waitForTimeout(2500);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  return { p, h };
};

// 1. Layout impact: document height with and without the panel.
const plain = await measure('');
const dev = await measure('?dev');
const delta = dev.h - plain.h;
console.log(`document height  plain ${plain.h}  dev ${dev.h}  delta ${delta}`);
console.log(delta === 0 ? 'PASS no layout impact' : 'FAIL panel changed the document');
await plain.p.close();

const p = dev.p;

// 2. Renders collapsed, then opens.
await p.screenshot({ path: `${out}/1-collapsed.png`, clip: { x: 0, y: 700, width: 420, height: 200 } });
await p.evaluate(() => document.querySelector('#tps-devpanel').shadowRoot.querySelector('.dot').click());
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/2-open.png`, clip: { x: 0, y: 520, width: 420, height: 380 } });

// 3. Does the readout match the section actually filling the frame?
const read = () => p.evaluate(() => {
  const sr = document.querySelector('#tps-devpanel').shadowRoot;
  const on = sr.querySelector('li[data-on="true"]');
  const truth = [...document.querySelectorAll('[data-section]')]
    .map(el => {
      const r = el.getBoundingClientRect();
      return { name: el.dataset.section, seen: Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) };
    })
    .sort((a, b) => b.seen - a.seen)[0];
  return { says: on?.textContent.replace(/^\d+/, '').trim(), truth: truth.name, foot: sr.querySelector('.pos').textContent };
});

console.log('\nvh   panel says      actually showing   match');
let allMatch = true;
for (const vh of [0, 2, 4, 6, 8, 10, 12, 14, 16, 17.5]) {
  await p.evaluate(v => scrollTo(0, v * innerHeight), vh);
  await p.waitForTimeout(700);
  const r = await read();
  const ok = r.says === r.truth;
  if (!ok) allMatch = false;
  console.log(`${String(vh).padEnd(5)}${(r.says || '-').padEnd(16)}${r.truth.padEnd(19)}${ok ? 'ok' : 'MISMATCH'}`);
}
console.log(allMatch ? 'PASS readout tracks the page' : 'FAIL readout drifted');

await p.evaluate(() => scrollTo(0, innerHeight * 5));
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}/3-midpage.png`, clip: { x: 0, y: 520, width: 420, height: 380 } });

await b.close();
