#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const orgQueriesDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');
const manifestPath = path.join(orgQueriesDir, 'orgs-sp-manifest.json');

// ---------- 1. .ts files ---------------------------------------------------
const tsFiles = fs.readdirSync(orgQueriesDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
const spTsFiles = tsFiles.map((f) => path.basename(f, '.ts'));

// ---------- 2. re-exports in index.ts --------------------------------------
const indexSrc = fs.readFileSync(path.join(orgQueriesDir, 'index.ts'), 'utf8');
const spTsExports = indexSrc
  .split('\n')
  .filter(Boolean)
  .map((line) => line.trim().replace(/export\s+\*\s+from\s+'\.\/(.*?)';?/, '$1'));

// ---------- 3. (Removed) CREATE PROCEDURE lines in ActivatePendingAccount ------------
// The stored procedure file is now gone, so this section is omitted.

// ---------- 4. Write manifest ---------------------------------------------
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

const manifest = {
  spTsFiles,
  spTsExports,
  matchingFilesAndExports: arraysEqual(spTsFiles.sort(), spTsExports.sort()),
  // No more stored procedure definitions to track
};

const json = JSON.stringify(manifest, null, 2) + '\n';
if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== json) {
  fs.writeFileSync(manifestPath, json);
  console.log(
    `✨  orgs-sp-manifest.json updated` +
      ` (files ${spTsFiles.length}, exports ${spTsExports.length})`
  );
} else {
  console.log('↪︎  orgs-sp-manifest.json unchanged – skipped write');
}