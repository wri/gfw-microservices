#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const orgQueriesDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');
const manifestPath = path.join(orgQueriesDir, 'orgs-sp-manifest.json');
const activateSqlPath = path.resolve(
  process.cwd(),
  'database/gfwpro/storedprocedures/dbo.uspActivatePendingAccount.StoredProcedure.sql'
);

// ---------- 1. .ts files ---------------------------------------------------
const tsFiles = fs.readdirSync(orgQueriesDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
const spTsFiles = tsFiles.map((f) => path.basename(f, '.ts'));

// ---------- 2. re-exports in index.ts --------------------------------------
const indexSrc = fs.readFileSync(path.join(orgQueriesDir, 'index.ts'), 'utf8');
const spTsExports = indexSrc
  .split('\n')
  .filter(Boolean)
  .map((line) => line.trim().replace(/export\s+\*\s+from\s+'\.\/(.*?)';?/, '$1'));

// ---------- 3. CREATE PROCEDURE lines in ActivatePendingAccount ------------
let definitionsInActivatePendingAccount = [];
if (fs.existsSync(activateSqlPath)) {
  const sql = fs.readFileSync(activateSqlPath, 'utf8');

  //           ┌─────────────────────────────────────────────────────────────┐
  //           │CREATE [OR ALTER] PROCEDURE  [dbo.]uspWhatever               │
  //           └─────────────────────────────────────────────────────────────┘
  const rx = /CREATE\s+(?:OR\s+ALTER\s+)?PROCEDURE\s+(?:\[\s*dbo\s*\]\.|dbo\.)?\[?(usp[\w$]+)\]?/gi;

  const found = new Set();
  let m;
  while ((m = rx.exec(sql)) !== null) found.add(m[1]); // m[1] = 'uspSomething'
  definitionsInActivatePendingAccount = [...found];
} else {
  console.warn(`⚠️  Could not read ${activateSqlPath} – activateSpDefs will be empty`);
}

// ---------- 4. Write manifest ---------------------------------------------
function findUndeletedSps(spTsArray, activatePendingSpArray) {
  const revertedName = (spTsName) =>
    `usp${spTsName.charAt(0).toUpperCase() + spTsName.slice(1, spTsName.length + 1)}`;
  return spTsArray.filter((element) => activatePendingSpArray.includes(revertedName(element)));
}
const manifest = {
  spTsFiles,
  spTsExports: spTsExports,
  matchingFilesAndExports: spTsFiles.length === spTsExports.length,
  definitionsInActivatePendingAccount: definitionsInActivatePendingAccount,
  undeletedSpInActivatePendingAccountFile: findUndeletedSps(
    spTsFiles,
    definitionsInActivatePendingAccount
  ),
};

const json = JSON.stringify(manifest, null, 2);
if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== json) {
  fs.writeFileSync(manifestPath, json);
  console.log(
    `✨  orgs-sp-manifest.json updated` +
      ` (files ${spTsFiles.length}, exports ${spTsExports.length}, activateSpDefs ${definitionsInActivatePendingAccount.length})`
  );
} else {
  console.log('↪︎  orgs-sp-manifest.json unchanged – skipped write');
}
