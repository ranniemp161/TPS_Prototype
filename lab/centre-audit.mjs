/* Horizontal centring audit (TJ, 13 Oct 2026): each screen's content against the window's centre. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1865, 905], [1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1300);
  const measure = () => p.evaluate(() => {
    const deck = document.querySelector('[data-deck]').getBoundingClientRect();
    const on = [...document.querySelectorAll('.dk-page')].filter(s => s.getAttribute('aria-hidden') !== 'true');
    let L = 1e9, R = -1e9;
    on.forEach(s => s.querySelectorAll('.dk-in *').forEach(e => { if (e.children.length) return; const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right < deck.left || r.left > deck.right) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) return; L = Math.min(L, r.left); R = Math.max(R, r.right); }));
    return { name: document.querySelector('[data-step-name]').textContent, off: Math.round((L + R) / 2 - innerWidth / 2), L: Math.round(L), R: Math.round(R) };
  });
  const rows = [];
  for (let k = 0; k < 20; k++) {
    const m = await measure(); rows.push(`${m.name} ${m.off >= 0 ? '+' : ''}${m.off}`);
    if (m.name === 'Due date') { await p.evaluate(() => { const f = document.getElementById('due'); f.value = '2027-05-15'; f.dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(300); }
    if (m.name === 'Your programme' && await p.$('[data-section="builder-decide"]:not([aria-hidden="true"])')) { await p.click('[data-not-yet]'); await p.waitForTimeout(1200); const c = await measure(); rows.push(`Close ${c.off}`); await p.fill('#capture-name', 'Test Mother'); await p.fill('#capture-email', 'a@b.com'); await p.click('.capture__btn'); await p.waitForTimeout(1200); const d = await measure(); rows.push(`Done ${d.off}`); break; }
    await p.click('[data-next]'); await p.waitForTimeout(1100);
  }
  console.log(w + 'x' + h + ': ' + rows.join(' | '));
  await p.close();
}
await b.close();
