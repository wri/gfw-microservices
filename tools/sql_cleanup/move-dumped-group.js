#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Usage: node move-dumped-group.js [pattern]
// example: node move-dumped-group.js 'uspG*'
// If no pattern provided, tries common patterns until it finds matches.
const PATTERN_ARG = process.argv[2];

// --- PATHS ---
const dumpedDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization/dumped');
const orgDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');

if (!fs.existsSync(dumpedDir)) {
  console.error('Dumped directory not found:', dumpedDir);
  process.exit(1);
}

const tryPatterns = PATTERN_ARG ? [PATTERN_ARG] : ['uspG*', 'uspGet*', 'usp*'];

let dumpedFiles = [];
let usedPattern = null;

for (const p of tryPatterns) {
  const matches = glob.sync(`${p}.ts`, { cwd: dumpedDir });
  if (matches.length) {
    dumpedFiles = matches;
    usedPattern = p;
    break;
  }
}

if (!dumpedFiles.length) {
  console.warn('No dumped files matched tried patterns:', tryPatterns);
  console.warn('Dumped directory contents (for debugging):');
  const all = fs.readdirSync(dumpedDir).filter((f) => f.endsWith('.ts'));
  all.forEach((f) => console.log('  ', f));
  process.exit(0);
}

console.log(
  `Found ${dumpedFiles.length} dumped files matching pattern "${usedPattern}" in ${dumpedDir}`
);

let movedCount = 0;
let skippedCount = 0;

function naturalizeFilename(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  // Only remove a leading 'usp' prefix (case-insensitive).
  if (/^usp/i.test(base)) {
    const withoutPrefix = base.slice(3); // remove exactly the leading 'usp'
    if (!withoutPrefix) return filename;
    const normalized = withoutPrefix.charAt(0).toLowerCase() + withoutPrefix.slice(1);
    return normalized + ext;
  }

  // Fallback: return original filename
  return filename;
}

dumpedFiles.forEach((dumpedFile) => {
  const srcPath = path.join(dumpedDir, dumpedFile);
  const destName = naturalizeFilename(dumpedFile);
  const destPath = path.join(orgDir, destName);

  if (fs.existsSync(destPath)) {
    console.log(`⚠️  Skipping move: ${destName} already exists in organization directory.`);
    skippedCount++;
    return;
  }

  try {
    fs.renameSync(srcPath, destPath);
    movedCount++;
    console.log(`🚚  Moved ${dumpedFile} → ${destName}`);
  } catch (err) {
    console.error(`❌ Failed to move ${dumpedFile}:`, err.message);
  }
});

console.log(`\nDone. Moved: ${movedCount}. Skipped: ${skippedCount}.`);
