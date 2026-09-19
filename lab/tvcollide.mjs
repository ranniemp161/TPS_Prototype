import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
let bad = 0;
for (const [w, h] of [[1920,1080],[1600,900],[1440,820],[1280,670],[1024,768],[820,900],[700,800],[480,800],[390,844],[360,740]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(600);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
    const a=document.querySelector('.act--voices');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY); });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const q = s => { const e=document.querySelector(s); if(!e) return null;
      const b=e.getBoundingClientRect();
      return {t:Math.round(b.top),b:Math.round(b.bottom),l:Math.round(b.left),r:Math.round(b.right),
              vis: e.checkVisibility ? e.checkVisibility({checkOpacity:false,checkVisibilityCSS:true}) : true}; };
    return { pips:q('.tv2__pips'), idx:q('.tv2__index'), title:q('.tv2__title'),
             script:q('.tv2__script'), quote:q('.tv2__quote'), bar:q('.tv2__bar'),
             prev:q('.tv2__nav--prev'), next:q('.tv2__nav--next'),
             name:q('.tv2__name'), block:q('.tv2'), win: window.innerWidth };
  });
  const over = (a,c) => a&&c&&a.vis&&c.vis && !(a.b<=c.t||a.t>=c.b) && !(a.r<=c.l||a.l>=c.r);
  const issues = [];
  if (over(r.pips, r.title)) issues.push('avatar previews overlap the title');
  if (over(r.idx, r.title)) issues.push('counter overlaps the title');
  if (over(r.pips, r.script)) issues.push('avatar previews overlap the script line');
  if (over(r.idx, r.script)) issues.push('counter overlaps the script line');
  if (over(r.pips, r.idx)) issues.push('faces and counter overlap each other');
  if (r.title && r.pips && r.pips.t < r.title.t) issues.push('faces are still above the title');
  if (r.idx && r.quote && r.idx.b > r.quote.t) issues.push('counter runs into the quote');
  if (over(r.script, r.quote)) issues.push('script line overlaps the quote');
  if (over(r.prev, r.quote)) issues.push('back arrow overlaps the quote');
  if (over(r.next, r.quote)) issues.push('forward arrow overlaps the quote');
  if (over(r.prev, r.name)) issues.push('back arrow overlaps the author');
  if (over(r.prev, r.bar)) issues.push('back arrow overlaps the progress bar');
  if (over(r.prev, r.next)) issues.push('the two arrows overlap each other');
  if (r.prev && r.prev.l < 0) issues.push(`back arrow off screen by ${-r.prev.l}px`);
  if (r.next && r.next.r > r.win) issues.push(`forward arrow off screen by ${r.next.r - r.win}px`);
  const gapTop = r.pips && r.script ? r.pips.t - r.script.b : null;
  // Flanking or stacked? Measure whichever gap actually exists: sideways
  // to the text when the arrows sit beside it, downward from the progress
  // bar when they sit under it.
  const flanking = r.prev && r.quote && !(r.prev.b <= r.quote.t || r.prev.t >= r.quote.b);
  const gapBot = !r.prev ? null
    : flanking ? r.quote.l - r.prev.r
    : r.prev.t - r.bar.b;
  if (gapTop !== null && gapTop < 6) issues.push(`only ${gapTop}px between the script line and the faces`);
  if (gapBot !== null && gapBot < 8) issues.push(`only ${gapBot}px of clearance around the back arrow`);
  if (issues.length) bad++;
  console.log(`  ${(w+'x'+h).padEnd(10)} ${issues.length ? 'ISSUE  '+issues.join('; ') : `ok   script to faces ${gapTop}px, arrow clearance ${gapBot}px ${flanking?'(beside)':'(below)'}`}`);
  await p.close();
}
console.log(bad ? `\n${bad} size(s) with a collision.` : '\nNo collisions at any size.');
await b.close();
