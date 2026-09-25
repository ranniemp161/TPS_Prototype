/* Encode the homepage seven-beat flythrough for scroll scrubbing. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('usage: node lab/home-flight-encode.mjs <source.mp4>'); process.exit(1); }
const run = args => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
mkdirSync('assets/video', { recursive: true });
mkdirSync('assets/img', { recursive: true });
const clips = [
  { out: 'assets/video/home-flight.mp4', scale: 'scale=1920:-2', gop: 8, crf: 24 },
  { out: 'assets/video/home-flight-m.mp4', scale: 'scale=1280:-2', gop: 4, crf: 27 },
];
for (const c of clips) {
  run(['-i', src, '-an', '-vf', c.scale + ':flags=lanczos,format=yuv420p',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(c.crf),
    '-bf', '0', '-g', String(c.gop), '-keyint_min', String(c.gop), '-sc_threshold', '0',
    '-movflags', '+faststart', c.out]);
  console.log(c.out, (statSync(c.out).size / 1048576).toFixed(1) + ' MB');
}
const stills = [
  ['home-handover', 0.20], ['home-exterior', 2.50], ['home-kitchen', 6.20],
  ['home-living', 10.70], ['home-nursery', 15.30], ['home-treatment', 20.50],
  ['home-window-exit', 26.80],
];
for (const [name, t] of stills) {
  run(['-ss', String(t), '-i', clips[0].out, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', 'assets/img/' + name + '.webp']);
  console.log('assets/img/' + name + '.webp', (statSync('assets/img/' + name + '.webp').size / 1024).toFixed(0) + ' KB');
}
