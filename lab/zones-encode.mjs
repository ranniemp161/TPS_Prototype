/* Encodes the zones film (the house plan whose rooms light up one by one)
   for scrubbing, and pulls the room stills. Same rules as care-encode.mjs:
   dense GOP, no B frames, no audio, faststart, stills from the ENCODED file.

   The phone file is cropped to the house itself. The source frame is 16:9
   with the house in the middle 46% (x 26% to 72%) on pure white, so a full
   frame on a phone would show a small house between two white bands.

   The film's ground is pure white and the page is paper (#F3EFEC). The
   paper is multiplied into every pixel here, at encode time, so white
   becomes exactly the page and the plan sits on it with no box. Doing it
   in CSS with mix-blend-mode did not hold: headless Chrome drew the box,
   and blending on video is unreliable in Safari. 243/255, 239/255, 236/255.

   Usage: node lab/zones-encode.mjs "<path to Zones.mp4>"
   Rerun whenever the film changes, then recheck the ROOMS table in zones.js. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('usage: node lab/zones-encode.mjs <source.mp4>'); process.exit(1); }

// Nudged above the plain ratios to cancel the rounding of the yuv420p round
// trip, measured so the decoded ground lands on 243, 239, 236.
const PAPER = 'colorchannelmixer=rr=0.9608:gg=0.9452:bb=0.9325';
const run = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
mkdirSync('assets/video', { recursive: true });

const clips = [
  { out: 'assets/video/zones.mp4',   vf: `scale=1600:-2:flags=lanczos,${PAPER}`, gop: 8, crf: 24 },
  // 968 by 1080 from x 465 keeps the house (x 26% to 72% of 1936) with a margin.
  { out: 'assets/video/zones-m.mp4', vf: `crop=968:1080:465:0,scale=720:-2:flags=lanczos,${PAPER}`, gop: 4, crf: 26 },
];

for (const c of clips) {
  run(['-i', src, '-an',
    '-vf', `${c.vf},format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(c.crf),
    '-bf', '0', '-g', String(c.gop), '-keyint_min', String(c.gop), '-sc_threshold', '0',
    '-movflags', '+faststart', c.out]);
  console.log(c.out, (statSync(c.out).size / 1048576).toFixed(1) + ' MB');
}

// One still per state, from the desktop file. Keep in step with zones.js.
const stills = [
  ['zones-day',      3.0],
  ['zones-living',   4.5],
  ['zones-kitchen',  5.6],
  ['zones-nursery',  7.0],
  ['zones-bathroom', 8.4],
  ['zones-all',     10.0],
];
for (const [name, t] of stills) {
  run(['-ss', String(t), '-i', clips[0].out, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', `assets/img/${name}.webp`]);
  console.log(`assets/img/${name}.webp`, (statSync(`assets/img/${name}.webp`).size / 1024).toFixed(0) + ' KB');
}
