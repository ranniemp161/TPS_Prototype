/* FUNNEL-PLAN.md chat 5: the close and Done, both versions. node lab/funnel-close-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const t = new Date(); t.setHours(0, 0, 0, 0);
const add = (days, months = 0) => { const d = new Date(t.getFullYear(), t.getMonth() + months, t.getDate() + days); return d; };
const cases = [
  { tag: 'far', due: add(0, 7), kind: 'hold', phrase: 'Your baby is due in 7 months.', title: 'Hold this price', btn: 'Hold my price', done: 'Your programme is on its way, and your price is held for twelve months.' },
  { tag: 'near', due: add(35), kind: 'dates', phrase: 'Your baby is due in 5 weeks.', title: 'Check my dates', btn: 'Check my dates', done: 'Your programme is on its way, and we’ll come back to you within one working day.' },
  { tag: 'born', due: add(-21), kind: 'dates', phrase: 'Your baby arrived 3 weeks ago.', title: 'Check my dates', btn: 'Check my dates', done: 'Your programme is on its way, and we’ll come back to you within one working day.' },
  { tag: 'edge', due: add(0, 3), kind: 'dates', phrase: null, title: 'Check my dates', btn: 'Check my dates', done: null },
];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const c of cases) {
    if (w === 390 && c.tag === 'edge') continue;
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1300);
    const tag = w + 'x' + h + ' ' + c.tag;
    const name = () => p.evaluate(() => document.querySelector('[data-step-name]').textContent);
    const step = async () => { await p.click('[data-next]'); await p.waitForTimeout(1000); };
    await step(); await p.evaluate(v => { const f = document.getElementById('due'); f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }, iso(c.due)); await p.waitForTimeout(300);
    for (let k = 0; k < 40 && (await name()) !== 'Your programme'; k++) await step();
    // 13 Oct 2026: the end was merged; Your programme is one screen and [data-not-yet] is the only way on to the close.
    await p.click('[data-not-yet]'); await p.waitForTimeout(1300);
    const s = await p.evaluate(() => {
      const vis = el => el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
      const sec = document.querySelector('[data-section="builder-close"]');
      const v = [...sec.querySelectorAll('.close__v')].filter(e => !e.closest('.capture__btn')).find(vis);
      const f = document.querySelector('[data-capture]');
      const fields = {}; ['due', 'fee', 'days', 'format', 'shift', 'meals', 'treatments', 'rhythm', 'priorities', 'budget', 'summary', 'close', 'generated'].forEach(k => fields[k] = f.elements[k].value);
      return {
        name: document.querySelector('[data-step-name]').textContent,
        kind: document.querySelector('.dk').getAttribute('data-close'),
        title: v && v.querySelector('.dk-step__t').textContent,
        lead: v && v.querySelector('.step__note').textContent,
        btn: [...document.querySelectorAll('.capture__btn .close__v')].filter(vis).map(e => e.textContent).join('|'),
        nextVis: getComputedStyle(document.querySelector('[data-next]')).visibility,
        fields, fee: document.querySelector('[data-fee]').textContent.trim(),
        dash: /[–—]/.test(sec.textContent), ovx: document.documentElement.scrollWidth > innerWidth,
      };
    });
    ok(s.name === 'Your programme', tag + ' Not yet lands on the close');
    ok(s.kind === c.kind, tag + ' version ' + s.kind);
    ok(s.title === c.title, tag + ' title ' + s.title);
    if (c.phrase) ok(s.lead.startsWith(c.phrase), tag + ' first sentence: ' + s.lead.slice(0, 40));
    ok(s.btn === c.btn, tag + ' button ' + s.btn);
    ok(s.nextVis === 'hidden', tag + ' Next hidden on the close');
    ok(s.fields.due === iso(c.due) && s.fields.close === c.kind && s.fields.days === '5' && s.fields.format === 'live-in' && /^\d+$/.test(s.fields.fee) && s.fields.summary.includes('DUE DATE') && s.fields.generated, tag + ' hidden fields ' + JSON.stringify({ due: s.fields.due, fee: s.fields.fee, close: s.fields.close, meals: s.fields.meals, treatments: s.fields.treatments.slice(0, 30) }));
    ok(!s.dash && !s.ovx, tag + ' no dashes, no overflow');
    if (c.tag !== 'edge') await p.screenshot({ path: `lab/funnel/close-${c.tag}-${w}x${h}.png` });
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900);
    ok((await name()) === 'Your programme', tag + ' arrow key cannot skip to Done');
    await p.click('.capture__btn'); await p.waitForTimeout(600);
    ok((await name()) === 'Your programme', tag + ' empty email does not send');
    await p.fill('#capture-name', 'Test Mother'); await p.fill('#capture-email', 'test@example.com'); await p.click('.capture__btn'); await p.waitForTimeout(1300);
    const d = await p.evaluate(() => ({ name: document.querySelector('[data-step-name]').textContent, line: document.querySelector('[data-section="builder-done"] .step__note').innerText.trim(), links: [...document.querySelectorAll('[data-section="builder-done"] a')].map(a => a.textContent), nextVis: getComputedStyle(document.querySelector('[data-next]')).visibility }));
    ok(d.name === 'Done', tag + ' sending lands on Done');
    if (c.done) ok(d.line === c.done, tag + ' Done line: ' + d.line);
    ok(d.links.join('|') === 'Return to the site|Book a call' && d.nextVis === 'hidden', tag + ' Done links, no Next');
    if (c.tag !== 'edge') await p.screenshot({ path: `lab/funnel/done-${c.tag}-${w}x${h}.png` });
    ok(!errs.length, tag + ' no page errors ' + errs.join('; '));
    await p.close();
  }
}
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
