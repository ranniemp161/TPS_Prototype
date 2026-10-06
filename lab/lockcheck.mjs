/* SECTION LOCKS
   TJ's rule: once a section is finished, it stays finished until he returns
   to it deliberately. Work on one thing must not quietly change another.

   This replaces the hero only guard (herolock.mjs, retired 5 Oct 2026). It
   protects any section, on any page, by its data-section name.

   A lock is a fingerprint of a section as TJ approved it:
     the markup (copy included, with run time classes and inline styles
     removed) and the computed styles of every element inside it, at a desktop
     and a phone width, with animation frozen.
   Because the CSS is shared, a change to a button or a heading style that
   reaches a locked section is caught, wherever the change was made.

     node lab/lockcheck.mjs list
     node lab/lockcheck.mjs record care.html:faq "note"    lock (or re lock) a section
     node lab/lockcheck.mjs check [--quiet]                 exit 2 if a locked section changed
     node lab/lockcheck.mjs unlock care.html:faq            TJ named it: it may change now
     node lab/lockcheck.mjs release care.html:faq           stop locking it

   Only record or re lock after TJ has seen the result and approved it. Never
   re lock to make a failure go away. */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'lab', 'locks');
const REG = path.join(DIR, 'registry.json');
const UNL = path.join(DIR, 'unlocked.json');
const SIZES = [[1440, 900], [390, 844]];
const [cmd, arg, note] = process.argv.slice(2);
const quiet = process.argv.includes('--quiet');

mkdirSync(DIR, { recursive: true });
const load = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const save = (f, v) => writeFileSync(f, JSON.stringify(v, null, 1));
const slug = id => id.replace(/[^a-z0-9]+/gi, '_');
const baseFile = id => path.join(DIR, slug(id) + '.json');

const PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'textAlign', 'color',
  'backgroundColor', 'backgroundImage', 'borderTopWidth', 'borderTopColor', 'borderBottomWidth', 'borderBottomColor', 'borderLeftWidth', 'borderRightWidth',
  'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'display', 'position', 'objectFit', 'objectPosition', 'backdropFilter', 'gap'];

function extract(sectionName, props) {
  const sec = document.querySelector(`[data-section="${sectionName}"]`);
  if (!sec) return null;
  const VOL = /^(is-[a-z-]+|sc-ready|js)$/;
  const clone = sec.cloneNode(true);
  [clone, ...clone.querySelectorAll('*')].forEach(n => {
    n.removeAttribute('style'); n.removeAttribute('data-sc-act'); n.removeAttribute('aria-expanded'); n.removeAttribute('hidden');
    if (n.hasAttribute('class')) { const k = [...n.classList].filter(c => !VOL.test(c)); if (k.length) n.setAttribute('class', k.join(' ')); else n.removeAttribute('class'); }
    if (n.matches && n.matches('[data-kin]')) n.textContent = n.textContent.replace(/\s+/g, ' ').trim();
  });
  const html = clone.outerHTML.replace(/\s+/g, ' ');
  const els = {};
  const walk = (n, p) => {
    const cs = getComputedStyle(n);
    const key = p + ':' + n.tagName.toLowerCase() + (n.classList[0] ? '.' + [...n.classList].find(c => !VOL.test(c)) : '');
    els[key] = props.map(k => cs[k]).join('|') + '|w' + Math.round(n.getBoundingClientRect().width);
    [...n.children].forEach((c, i) => walk(c, p + '.' + i));
  };
  walk(sec, '0');
  return { html, els, height: Math.round(sec.offsetHeight) };
}

async function fingerprint(browser, page, section) {
  const out = {};
  for (const [w, h] of SIZES) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(ROOT, page)).href, { waitUntil: 'load' });
    await p.waitForTimeout(2800);
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
    await p.waitForTimeout(400);
    const r2 = await p.evaluate(({ s, pr, src }) => new Function('return ' + src)()(s, pr), { s: section, pr: PROPS, src: extractSrc }).catch(() => null);
    await p.close();
    if (!r2) return null;
    out[w] = { htmlHash: createHash('sha256').update(r2.html).digest('hex').slice(0, 16), height: r2.height, els: r2.els };
  }
  return out;
}
const extractSrc = extract.toString();

function diff(base, now) {
  const msgs = [];
  for (const w of Object.keys(base)) {
    const a = base[w], b = now[w];
    if (!b) { msgs.push(`${w}px: could not read the section`); continue; }
    if (a.htmlHash !== b.htmlHash) msgs.push(`${w}px: markup or copy changed`);
    if (Math.abs(a.height - b.height) > 2) msgs.push(`${w}px: section height ${a.height} to ${b.height}`);
    const ak = Object.keys(a.els), bk = Object.keys(b.els);
    const added = bk.filter(k => !(k in a.els)), removed = ak.filter(k => !(k in b.els));
    if (added.length) msgs.push(`${w}px: ${added.length} element(s) added, e.g. ${added[0]}`);
    if (removed.length) msgs.push(`${w}px: ${removed.length} element(s) removed, e.g. ${removed[0]}`);
    let shown = 0, total = 0;
    for (const k of ak) {
      if (!(k in b.els)) continue;
      const pa = a.els[k].split('|'), pb = b.els[k].split('|');
      const names = [...PROPS, 'width'];
      const ch = [];
      pa.forEach((v, i) => {
        if (v === pb[i]) return;
        if (names[i] === 'width' && Math.abs(parseInt(v.slice(1)) - parseInt((pb[i] || 'w0').slice(1))) <= 1) return;
        ch.push(`${names[i]} ${v} to ${pb[i]}`);
      });
      if (ch.length) { total++; if (shown < 4) { msgs.push(`${w}px: ${k}  ${ch.slice(0, 3).join('; ')}`); shown++; } }
    }
    if (total > shown) msgs.push(`${w}px: and ${total - shown} more element(s) with style changes`);
  }
  return msgs;
}

const reg = load(REG, []);
const unl = load(UNL, []);

if (cmd === 'list') {
  if (!reg.length) console.log('No sections are locked yet.');
  reg.forEach(r => console.log(`${r.id.padEnd(34)} locked ${r.date}  ${unl.includes(r.id) ? '[UNLOCKED for editing]' : ''}  ${r.note || ''}`));
  process.exit(0);
}
if (cmd === 'release' || cmd === 'unlock') {
  if (!arg || !reg.find(r => r.id === arg)) { console.error('Unknown lock: ' + arg); process.exit(1); }
  if (cmd === 'release') { save(REG, reg.filter(r => r.id !== arg)); save(UNL, unl.filter(x => x !== arg)); console.log('released ' + arg); }
  else { if (!unl.includes(arg)) unl.push(arg); save(UNL, unl); console.log('unlocked for editing: ' + arg + ' (record it again once TJ approves the result)'); }
  process.exit(0);
}

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

if (cmd === 'record') {
  const [page, section] = (arg || '').split(':');
  if (!page || !section) { console.error('usage: record <page.html>:<section> ["note"]'); process.exit(1); }
  const fp = await fingerprint(browser, page, section);
  if (!fp) { console.error(`Could not find [data-section="${section}"] on ${page}`); await browser.close(); process.exit(1); }
  save(baseFile(arg), { id: arg, page, section, recorded: new Date().toISOString(), fp });
  const next = reg.filter(r => r.id !== arg); next.push({ id: arg, page, section, date: new Date().toISOString().slice(0, 10), note: note || '' });
  save(REG, next); save(UNL, unl.filter(x => x !== arg));
  console.log(`locked ${arg} (${Object.values(fp)[0].htmlHash}, ${Object.keys(Object.values(fp)[0].els).length} elements)`);
  await browser.close(); process.exit(0);
}

if (cmd === 'check') {
  let bad = 0; const lines = [];
  for (const r of reg) {
    if (unl.includes(r.id)) { if (!quiet) lines.push(`${r.id}: unlocked for editing, not checked`); continue; }
    const file = baseFile(r.id);
    if (!existsSync(file)) { lines.push(`${r.id}: baseline file is missing`); continue; }
    const base = JSON.parse(readFileSync(file, 'utf8'));
    const now = await fingerprint(browser, r.page, r.section);
    if (!now) { lines.push(`${r.id}: section not found on the page`); bad++; continue; }
    const d = diff(base.fp, now);
    if (d.length) { bad++; lines.push(`LOCKED SECTION CHANGED: ${r.id}`); d.slice(0, 9).forEach(m => lines.push('   ' + m)); }
    else if (!quiet) lines.push(`${r.id}: unchanged`);
  }
  await browser.close();
  lines.forEach(l => console.log(l));
  if (bad) { console.log('\nTJ marked these sections finished. Undo whatever changed them, unless TJ asked for a change to exactly this section (then unlock it first).'); process.exit(2); }
  process.exit(0);
}
console.error('commands: list | record | check | unlock | release'); await browser.close(); process.exit(1);
