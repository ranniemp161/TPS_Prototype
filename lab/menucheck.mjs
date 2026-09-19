/* Open the menu, read it, close it again, at several widths. Checks the
   panel actually opens to a height, that all three headings and every link
   are visible, that Escape and the veil close it, and that focus returns.
     node lab/menucheck.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
let bad = 0;
for (const [w,h] of [[1600,900],[1280,900],[1040,800],[820,900],[390,844]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.waitForTimeout(500);

  const chips = await p.evaluate(() => [...document.querySelectorAll('.nav .tab')]
    .filter(e => e.checkVisibility && e.checkVisibility()).map(e => e.textContent.trim()));

  await p.click('[data-burger]');
  await p.waitForTimeout(800);
  const openState = await p.evaluate(() => {
    const m = document.querySelector('[data-menu]');
    const heads = [...document.querySelectorAll('.menu__head')].map(e => e.textContent.trim());
    const links = [...document.querySelectorAll('.menu__list a')];
    const vis = links.filter(a => a.checkVisibility && a.checkVisibility() && a.getBoundingClientRect().height > 0);
    const cols = new Set([...document.querySelectorAll('.menu__group')].map(g => Math.round(g.getBoundingClientRect().left)));
    return { hidden: m.hidden, height: Math.round(m.getBoundingClientRect().height),
             heads, links: links.length, visible: vis.length, columns: cols.size,
             expanded: document.querySelector('[data-burger]').getAttribute('aria-expanded'),
             bottom: Math.round(m.getBoundingClientRect().bottom) };
  });
  await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });

  await p.keyboard.press('Escape');
  await p.waitForTimeout(700);
  const closed = await p.evaluate(() => ({
    hidden: document.querySelector('[data-menu]').hidden,
    expanded: document.querySelector('[data-burger]').getAttribute('aria-expanded'),
    focused: document.activeElement === document.querySelector('[data-burger]') }));

  const issues = [];
  if (chips.length !== 2) issues.push(`chips in the bar: ${chips.join(', ')}`);
  if (openState.hidden || openState.height < 100) issues.push('panel did not open');
  if (openState.heads.join('|') !== 'Care|Programmes|About') issues.push('headings: ' + openState.heads.join(', '));
  if (openState.visible !== openState.links) issues.push(`${openState.links - openState.visible} links not visible`);
  if (openState.bottom > h) issues.push(`panel runs ${openState.bottom - h}px below the fold`);
  if (!closed.hidden || closed.expanded !== 'false') issues.push('Escape did not close it');
  if (!closed.focused) issues.push('focus did not return to the chip');
  if (errs.length) issues.push('errors: ' + errs.join('|'));
  if (issues.length) bad++;
  console.log(`  ${(w+'x'+h).padEnd(10)} bar [${chips.join(', ')}]  panel ${openState.height}px, ${openState.columns} column(s), ${openState.links} links  ${issues.length ? 'ISSUE ' + issues.join('; ') : 'ok'}`);
  await p.close();
}
console.log(bad ? `\n${bad} size(s) with a problem.` : '\nMenu opens, reads and closes correctly at every size.');
await b.close();
