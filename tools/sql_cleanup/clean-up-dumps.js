#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// --- CONFIGURABLE FILTER ---
const DUMPED_FILTER = 'uspD*'; // Change this to 'uspAdd*', etc. for other batches

// --- PATHS ---
const dumpedDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization/dumped');
const orgDir = path.resolve(process.cwd(), 'libs/sql/src/lib/queries/organization');

// --- 1. Find all dumped files matching the filter ---
const dumpedFiles = glob.sync(`${DUMPED_FILTER}.ts`, { cwd: dumpedDir });

console.log(`Found ${dumpedFiles.length} dumped files matching filter "${DUMPED_FILTER}"`);

let deletedCount = 0;

dumpedFiles.forEach((dumpedFile) => {
  // Remove every 'usp' and lowercase the next character after each removal
  // Example: uspGetListLocations.ts -> getListLocations.ts
  let transformed = dumpedFile;
  let idx;
  while ((idx = transformed.indexOf('usp')) !== -1) {
    if (idx + 3 < transformed.length) {
      // Lowercase the next character after 'usp'
      transformed =
        transformed.slice(0, idx) +
        transformed.charAt(idx + 3).toLowerCase() +
        transformed.slice(idx + 4);
    }
    // Remove 'usp'
    transformed = transformed.slice(0, idx) + transformed.slice(idx + 3);
  }

  const orgFileName = transformed;
  const orgFilePath = path.join(orgDir, orgFileName);

  if (fs.existsSync(orgFilePath)) {
    // File exists in orgDir, delete from dumped
    fs.unlinkSync(path.join(dumpedDir, dumpedFile));
    deletedCount++;
    console.log(`🗑️  Deleted dumped/${dumpedFile} (exists as ${orgFileName})`);
  } else {
    console.log(`✅  Keeping dumped/${dumpedFile} (no match in org dir)`);
  }
});

console.log(
  `\nDone. Deleted ${deletedCount} dumped files that already exist in the organization directory.`
);
