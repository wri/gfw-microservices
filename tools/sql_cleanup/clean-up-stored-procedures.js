/**
 * Script to identify stored procedures scripts already implemented in typescript
 */
const fs = require('fs');
const path = require('path');

// Paths based on script location in tools/scripts
const sqlDirectories = {
  system: path.join(__dirname, '../../database/gfwpro/storedprocedures'),
  organization: path.join(__dirname, '../../database/clientstore/storedprocedures'),
};

const tsDirectories = {
  system: path.join(__dirname, '../../libs/sql/src/lib/queries/system'),
  organization: path.join(__dirname, '../../libs/sql/src/lib/queries/organization'),
};

// Helper to get all SQL file paths in storedprocedures directories
function getSqlFiles(dir) {
  let sqlFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      sqlFiles = sqlFiles.concat(getSqlFiles(filePath));
    } else if (file.startsWith('dbo.usp') && file.endsWith('.sql')) {
      sqlFiles.push(filePath);
    }
  });

  return sqlFiles;
}

// Helper to clean up the stored procedure name according to our logic
function cleanQueryName(storedProcedureName) {
  // Remove "dbo.usp" at the beginning and ".StoredProcedure" at the end
  let cleanName = storedProcedureName.replace(/^dbo\.usp/, '').replace(/\.StoredProcedure$/, '');

  // Lowercase the first letter of the remaining name
  cleanName = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);

  return cleanName;
}

// Helper to check if an SQL file is implemented in TypeScript
function isImplemented(sqlFile, isSystemQuery) {
  const storedProcedureName = path.basename(sqlFile, '.sql');
  const cleanName = cleanQueryName(storedProcedureName);

  const tsDir = isSystemQuery ? tsDirectories.system : tsDirectories.organization;
  const tsFiles = fs.readdirSync(tsDir);

  return tsFiles.includes(`${cleanName}.ts`);
}

// Main script
function cleanUpStoredProcedures() {
  let implementedFiles = [];
  let notImplementedFiles = [];

  // Check system SQL files
  const systemSqlFiles = getSqlFiles(sqlDirectories.system);
  systemSqlFiles.forEach((sqlFile) => {
    if (isImplemented(sqlFile, true)) {
      implementedFiles.push(sqlFile);
    } else {
      notImplementedFiles.push(sqlFile);
    }
  });

  // Check organization SQL files
  const organizationSqlFiles = getSqlFiles(sqlDirectories.organization);
  organizationSqlFiles.forEach((sqlFile) => {
    if (isImplemented(sqlFile, false)) {
      implementedFiles.push(sqlFile);
    } else {
      notImplementedFiles.push(sqlFile);
    }
  });

  // console.log('Implemented SQL files:');
  // console.log(implementedFiles);

  console.log('Not Implemented SQL files:', notImplementedFiles.length);
  console.log(notImplementedFiles);

  // Option to delete implemented files (uncomment to use)
  /*
		implementedFiles.forEach((file) => {
				fs.unlinkSync(file);
				console.log(`Deleted: ${file}`);
		});
		*/
}

cleanUpStoredProcedures();
