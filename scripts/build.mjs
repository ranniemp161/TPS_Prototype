import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const siteRoot = path.resolve(projectRoot, '_site');

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
]);

const ignoreFiles = new Set([
  'BRIEF.md',
  'DESIGN.md',
  'LOCKED.md',
  'SITE-PLAN.md',
  'vercel.json',
  '.vercelignore',
]);

function ensureSiteRoot() {
  fs.rmSync(siteRoot, { recursive: true, force: true });
  fs.mkdirSync(siteRoot, { recursive: true });
}

function isIgnoredName(name) {
  return ignoreDirs.has(name) || ignoreFiles.has(name);
}

function copySite() {
  // Copy everything from root except ignored items
  for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
    const source = path.join(projectRoot, entry.name);
    const target = path.join(siteRoot, entry.name);

    if (isIgnoredName(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.cpSync(source, target, { recursive: true, force: true });
    } else {
      fs.copyFileSync(source, target);
    }
  }

  // If index/ exists, flatten it to _site root (matching GitHub Pages workflow)
  const indexDir = path.join(siteRoot, 'index');
  if (fs.existsSync(indexDir)) {
    for (const entry of fs.readdirSync(indexDir, { withFileTypes: true })) {
      const source = path.join(indexDir, entry.name);
      const target = path.join(siteRoot, entry.name);

      if (entry.isDirectory()) {
        fs.cpSync(source, target, { recursive: true, force: true });
      } else {
        fs.copyFileSync(source, target);
      }
    }
    fs.rmSync(indexDir, { recursive: true });
  }

  // Write build info
  const buildInfo = {
    sha: process.env.GITHUB_SHA || 'local',
    built: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(siteRoot, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
}

try {
  ensureSiteRoot();
  copySite();

  const files = fs.readdirSync(siteRoot).sort();
  console.log('Site build complete. Output files:');
  for (const file of files) {
    console.log(` - ${file}`);
  }
} catch (error) {
  console.error('Site build failed.');
  console.error(error);
  process.exit(1);
}
