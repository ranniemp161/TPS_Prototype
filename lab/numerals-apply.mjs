// Number words to numerals in visible body text (TJ, 1 Nov 2026; Opus).
// Titles, "one", idioms ("no two") and ordinals stay. Each find must match the
// expected count or nothing is written for that file.
// Backs up each file to lab/<name>.before-numerals.<ext>.bak first.
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const EDITS = {
  'index/index.html': [
    ['<p class="bath__lead">In thirty days</p>', '<p class="bath__lead">In 30 days</p>', 1],
    ['Up to three fresh meals a day', 'Up to 3 fresh meals a day', 1],
    ['data-body="Two weeks, and the treatments', 'data-body="2 weeks, and the treatments', 1],
    ['Thirty days of daily support, all four areas of care', '30 days of daily support, all 4 areas of care', 1],
  ],
  'index/programmes.html': [
    ['Three programmes, from seven days to thirty.', '3 programmes, from 7 days to 30.', 1],
    ['We offer three live-in care programmes, ranging from seven to thirty days', 'We offer 3 live-in care programmes, ranging from 7 to 30 days', 1],
    ['Up to three fresh meals a day', 'Up to 3 fresh meals a day', 2],
    ['the same four areas of care', 'the same 4 areas of care', 1],
    ['Thirty minutes by phone or video', '30 minutes by phone or video', 1],
  ],
  'index/build-your-programme.html': [
    ['<span class="length__sub">Two weeks</span>', '<span class="length__sub">2 weeks</span>', 1],
    ['Thirty minutes by phone or video', '30 minutes by phone or video', 1],
    ['your price held for seven days', 'your price held for 7 days', 1],
    ['your price is held for seven days', 'your price is held for 7 days', 1],
    ['Indicative pricing is held for three months.', 'Indicative pricing is held for 3 months.', 1],
  ],
  'index/what-we-do.html': [
    ['Nine months of carrying.', '9 months of carrying.', 1],
    ['guided by two priorities', 'guided by 2 priorities', 3],
    ['Up to three fresh meals a day', 'Up to 3 fresh meals a day', 3],
    ['Up to three fresh meals are cooked', 'Up to 3 fresh meals are cooked', 1],
    ['Twelve hours of care', '12 hours of care', 1],
    ['Six hours of care through the afternoon and six hours through the night', '6 hours of care through the afternoon and 6 hours through the night', 1],
  ],
  'index/faqs.html': [
    ['up to three freshly cooked meals', 'up to 3 freshly cooked meals', 1],
    ['up to four months', 'up to 4 months', 1],
    ['due four weeks before', 'due 4 weeks before', 1],
    ['from two weeks before to two weeks after', 'from 2 weeks before to 2 weeks after', 1],
  ],
  'index/js/home-flight.js': [
    ["'Three fresh meals are cooked in your kitchen", "'3 fresh meals are cooked in your kitchen", 1],
  ],
  'index/js/build-your-programme-pricing.js': [
    ["4: 'Four times a week', 3: 'Three times a week'", "4: '4 times a week', 3: '3 times a week'", 1],
  ],
  'index/js/build-your-programme.js': [
    ["'  (held for three months)'", "'  (held for 3 months)'", 1],
    ["var WORDS = { 7: 'seven', 14: 'fourteen', 30: 'thirty' };", "var WORDS = { 7: '7', 14: '14', 30: '30' }; // numerals (TJ, 1 Nov 2026)", 1],
    ["var COUNTS = ['none', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];", "var COUNTS = ['none', '1', '2', '3', '4', '5', '6']; // numerals (TJ, 1 Nov 2026)", 1],
    ["'The full thirty days, complete, is '", "'The full 30 days, complete, is '", 1],
    ["'Show me the thirty day programme'", "'Show me the 30 day programme'", 1],
    ["'Seven days begins at '", "'7 days begins at '", 1],
  ],
};
let bad = 0;
for (const [rel, edits] of Object.entries(EDITS)) {
  const file = path.join(ROOT, rel);
  let src = readFileSync(file, 'utf8');
  let ok = true;
  for (const [from, to, n] of edits) {
    const got = src.split(from).length - 1;
    if (got !== n) { console.log(`MISMATCH ${rel}: "${from.slice(0, 50)}" found ${got}, expected ${n}`); ok = false; }
  }
  if (!ok) { bad++; continue; }
  const base = path.basename(rel); const ext = path.extname(base);
  const bak = path.join(ROOT, 'lab', `${base.slice(0, -ext.length)}.before-numerals${ext}.bak`);
  if (!existsSync(bak)) copyFileSync(file, bak);
  for (const [from, to] of edits) src = src.split(from).join(to);
  writeFileSync(file, src);
  console.log(`ok ${rel}: ${edits.reduce((a, e) => a + e[2], 0)} changes`);
}
process.exit(bad ? 1 : 0);
