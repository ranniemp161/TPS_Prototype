import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.resolve(projectRoot, 'dist');

const ignoreDirs = new Set([
  '.git',
  '.github',
  '.claude',
  'node_modules',
  'lab',
  'scrollcraft',
  '.agents',
  'archive',
  'research',
  '_site',
  'dist',
]);

const ignoreFiles = new Set([
  'BRIEF.md',
  'DESIGN.md',
  'LOCKED.md',
  'SITE-PLAN.md',
  'vercel.json',
  '.vercelignore',
  '.gitignore',
]);

function ensureBuildRoot() {
  fs.rmSync(distRoot, { recursive: true, force: true });
  fs.mkdirSync(distRoot, { recursive: true });
}

function isIgnoredName(name) {
  return ignoreDirs.has(name) || ignoreFiles.has(name);
}

function copyStaticSite() {
  for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
    const source = path.join(projectRoot, entry.name);
    const target = path.join(distRoot, entry.name);

    if (isIgnoredName(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.cpSync(source, target, { recursive: true, force: true });
    } else {
      fs.copyFileSync(source, target);
    }
  }

  const rootHtml = path.join(projectRoot, 'v1.html');
  if (fs.existsSync(rootHtml)) {
    fs.copyFileSync(rootHtml, path.join(distRoot, 'index.html'));
  }

  const buildInfo = {
    sha: process.env.GITHUB_SHA || 'local',
    built: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(distRoot, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
}

try {
  ensureBuildRoot();
  copyStaticSite();

  const files = fs.readdirSync(distRoot).sort();
  console.log('Static site build complete. Output files:');
  for (const file of files) {
    console.log(` - ${file}`);
  }
} catch (error) {
  console.error('Static site build failed.');
  console.error(error);
  process.exit(1);
}
