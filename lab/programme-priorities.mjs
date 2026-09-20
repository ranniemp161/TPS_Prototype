/* What matters most: the six pills, and what happens when one is ticked.
 *
 *   node lab/programme-priorities.mjs        (needs the page served on 4321)
 *
 * They were wired to exactly one thing, the enquiry brief, and the brief
 * sits behind a button, so a client ticked three boxes and the page said
 * nothing back. A control that works and looks broken is worse than one
 * that is plainly missing. This holds the three things that answer her:
 * the count under the pills, the mark on the summary button, and the
 * brief itself keeping up. And that the fee never moves, which is the
 * spec's rule for this step.
 */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const fails=[]; const ok=(n,g,w)=>{ if(g!==w) fails.push(`${n}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); };
for (const [w,h,label] of [[1440,900,'desktop'],[390,844,'phone']]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('http://localhost:4321/programme.html',{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);

  const r = await p.evaluate(async () => {
    const q=s=>document.querySelector(s);
    const line=q('[data-prio-count]'), toggle=q('[data-brief-toggle]');
    const pills=[...document.querySelectorAll('.prio input')];
    const start = { linePainted: getComputedStyle(line).display, news: toggle.classList.contains('has-news') };
    pills[0].click(); await new Promise(r=>setTimeout(r,90));
    const one = { text: line.textContent, painted: getComputedStyle(line).display,
      news: toggle.classList.contains('has-news') };
    pills[3].click(); pills[5].click(); await new Promise(r=>setTimeout(r,90));
    const three = { text: line.textContent,
      brief: q('[data-brief-text]').textContent.match(/Priorities\n(.*)/)?.[1]?.trim() };
    // opening the summary clears the mark
    toggle.click(); await new Promise(r=>setTimeout(r,140));
    const opened = { news: toggle.classList.contains('has-news'), visible: !q('#brief').hidden };
    // a change while it is open should not re-mark it
    pills[1].click(); await new Promise(r=>setTimeout(r,90));
    const whileOpen = { news: toggle.classList.contains('has-news'),
      brief: q('[data-brief-text]').textContent.match(/Priorities\n(.*)/)?.[1]?.trim() };
    toggle.click(); await new Promise(r=>setTimeout(r,140));
    // untick everything
    [...document.querySelectorAll('.prio input:checked')].forEach(i=>i.click());
    await new Promise(r=>setTimeout(r,120));
    const none = { painted: getComputedStyle(line).display,
      brief: q('[data-brief-text]').textContent.match(/Priorities\n(.*)/)?.[1]?.trim(),
      fee: q('[data-fee]').textContent };
    return { start, one, three, opened, whileOpen, none };
  });

  ok(`${label} line hidden with none picked`, r.start.linePainted, 'none');
  ok(`${label} summary not marked at rest`, r.start.news, false);
  ok(`${label} one reads singular`, r.one.text, 'One thing noted for your call.');
  ok(`${label} line appears`, r.one.painted, 'block');
  ok(`${label} summary marked`, r.one.news, true);
  ok(`${label} three counts in words`, r.three.text, 'Three things noted for your call.');
  ok(`${label} and all three reach the brief`, r.three.brief,
     'Sleep and rest, Nourishment and meals and Support for the wider family');
  ok(`${label} opening clears the mark`, r.opened.news, false);
  ok(`${label} and shows the brief`, r.opened.visible, true);
  ok(`${label} no re-mark while it is open`, r.whileOpen.news, false);
  ok(`${label} brief keeps up while open`, /My own physical recovery/.test(r.whileOpen.brief), true);
  ok(`${label} line goes again at zero`, r.none.painted, 'none');
  ok(`${label} brief says none indicated`, r.none.brief, 'None indicated');
  ok(`${label} and the fee never moved`, r.none.fee, '£1,995');
  if(errs.length) fails.push(`${label} errors: ${errs.join(' | ')}`);
  await p.close();
}
await b.close();
console.log(fails.length?'FAIL\n'+fails.join('\n'):'Priority feedback checks passed.');
process.exit(fails.length?1:0);
