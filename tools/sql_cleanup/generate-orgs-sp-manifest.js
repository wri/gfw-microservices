#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const exclude = [
  'index.ts'
];

const srcDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');
const files  = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts') && !exclude.includes(f));

const moduleFile = fs.readFileSync(`${srcDir}/${exclude[0]}`, 'utf-8');
const modules = moduleFile.split('\n').filter(Boolean).map((line) => line.replace("export * from './", '').replace("';", ''));
const fileNames = files.map(f => path.basename(f, '.ts'));

const manifest = JSON.stringify({
  files: fileNames,
  exports: modules,
  match: fileNames.length === modules.length
}, null, 2);

fs.writeFileSync(
  path.join(srcDir, 'sp-orgs-manifest.json'),
  manifest
);

console.log(`Wrote ${fileNames.length} entries to sp-manifest.json`);
