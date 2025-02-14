/**
 * Script to find stored procedures and their references in ts/js files
 */
const fs = require('fs');
const path = require('path');

// Paths based on script location
const sqlDirectories = {
  system: path.join(__dirname, '../../database/gfwpro/storedprocedures'),
  organization: path.join(__dirname, '../../database/clientstore/storedprocedures'),
};

// Path to TypeScript and JavaScript directories for code search
const codebaseDirectory = path.join(__dirname, '../../'); // Root directory of our codebase

// Path to log files
const logPath = path.join(__dirname, 'sql_cleanup_logs');
const logReferenced = path.join(logPath, 'referenced_sql_procedures.log');
const logUnreferenced = path.join(logPath, 'unreferenced_sql_procedures.log');

// Directories to exclude from search
const excludeDirectories = [
  'node_modules',
  '.nx',
  '.husky',
  '.vscode',
  'database',
  'dist',
  '.aws',
  '.git',
];

// Helper to create log directory if not exists
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}

// Helper to get all SQL file paths
function getSqlFiles(dir) {
  let sqlFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      sqlFiles = sqlFiles.concat(getSqlFiles(filePath));
    } else if (file.startsWith('dbo.usp') && file.endsWith('.sql')) {
      sqlFiles.push(filePath.replace(codebaseDirectory, ''));
    }
  });

  return sqlFiles;
}

// Helper to clean up the stored procedure name
function cleanQueryName(storedProcedureName) {
  return storedProcedureName.replace(/^dbo\.usp/, '').replace(/\.StoredProcedure$/, '');
}

// Helper to log to a file
function logToFile(filePath, data) {
  fs.appendFileSync(filePath, data + '\n', (err) => {
    if (err) throw err;
  });
}

// Helper to check if a directory should be excluded
function shouldExcludeDirectory(directory) {
  return excludeDirectories.some((excluded) => directory.includes(excluded));
}

// Helper to check if a procedure is referenced in the codebase
function searchFilesForReferences(directory, searchTerm) {
  const files = fs.readdirSync(directory);
  let referencesFound = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    // Skip excluded directories
    if (stat.isDirectory() && !shouldExcludeDirectory(filePath)) {
      referencesFound = referencesFound.concat(searchFilesForReferences(filePath, searchTerm));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (
        content.includes(searchTerm) ||
        content.includes(`sqlUtils.executeSystemStoredProcedure(req, '${searchTerm}'`)
      ) {
        referencesFound.push(filePath.replace(codebaseDirectory, ''));
      }
    }
  });

  return referencesFound;
}

// Main function to clean up and log results
function findStoredProcedures() {
  const reviewedProcedures = new Set(); // 'uspActivatePendingAccount'

  let implementedFiles = [];
  let unreferencedFiles = [];

  // Clean up system SQL files
  const systemSqlFiles = getSqlFiles(sqlDirectories.system);
  systemSqlFiles.forEach((sqlFile) => {
    const storedProcedureName = path.basename(sqlFile, '.sql');
    const cleanName = cleanQueryName(storedProcedureName);

    // Skip if the file has already been reviewed manually
    if (reviewedProcedures.has(cleanName)) {
      return;
    }

    const references = searchFilesForReferences(codebaseDirectory, cleanName);

    if (references.length > 0) {
      logToFile(
        logReferenced,
        `Procedure: ${cleanName}, File: ${sqlFile}, References: ${references}`
      );
      implementedFiles.push(sqlFile);
    } else {
      logToFile(logUnreferenced, `Procedure: ${cleanName}, File: ${sqlFile}, References: None`);
      unreferencedFiles.push(sqlFile);
    }
  });

  // Clean up organization SQL files
  const organizationSqlFiles = getSqlFiles(sqlDirectories.organization);
  organizationSqlFiles.forEach((sqlFile) => {
    const storedProcedureName = path.basename(sqlFile, '.sql');
    const cleanName = cleanQueryName(storedProcedureName);

    // Skip if the file has already been reviewed manually
    if (reviewedProcedures.has(cleanName)) {
      return;
    }

    const references = searchFilesForReferences(codebaseDirectory, cleanName);

    if (references.length > 0) {
      logToFile(
        logReferenced,
        `Procedure: ${cleanName}, File: ${sqlFile}, References: ${references}`
      );
      implementedFiles.push(sqlFile);
    } else {
      logToFile(logUnreferenced, `Procedure: ${cleanName}, File: ${sqlFile}, References: None`);
      unreferencedFiles.push(sqlFile);
    }
  });

  console.log('Search completed. Check logs for details.');
}

findStoredProcedures();
