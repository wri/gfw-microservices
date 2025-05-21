#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const exclude = ['index.ts'];

const srcDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');
const filePath = path.join(srcDir, 'orgs-sp-manifest.json');

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts') && !exclude.includes(f));
const moduleFile = fs.readFileSync(`${srcDir}/${exclude[0]}`, 'utf-8');

const modules = moduleFile
  .split('\n')
  .filter(Boolean)
  .map((line) => line.replace("export * from './", '').replace("';", ''));
const fileNames = files.map((f) => path.basename(f, '.ts'));

const manifest = {
  files: fileNames,
  exports: modules,
  match: fileNames.length === modules.length,
};
const fileContents = JSON.stringify(manifest, null, 2);

if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== fileContents) {
  try {
    fs.writeFileSync(path.join(srcDir, 'orgs-sp-manifest.json'), fileContents);
  } catch (error) {
    throw error;
  }
}

console.log(
  `Generated orgs-sp-manifest.json. Files found ${fileNames.length}. Module exports ${modules.length}`
);
