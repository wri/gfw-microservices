#!/usr/bin/env node
/* ------------------------------------------------------------------
   generate-prompts.mjs   (ES Module – Node ≥ 18)
   ------------------------------------------------------------------
   1. Collect every *.ts file in libs/sql/src/lib/queries/organization
      that contains the string “Auto-generated”.
   2. Estimate tokens (≈ chars * TOKEN_RATIO) for each file.
   3. Bucket files so each prompt stays ≤ MAX_TOKENS.
   4. For each bucket write ./prompts/<name>.json – Chat-API ready.
   5. Return / log an array of { promptPath, procedures, tokenEstimate }.
-------------------------------------------------------------------*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config();

/* ------------------  configuration  ------------------ */
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(ROOT, 'libs/sql/src/lib/queries/organization');
const PROMPT_DIR = path.join(ROOT, 'prompts');

const MODEL = 'gpt-4o-mini'; // cheapest that still gives good output
const MAX_TOKENS = 6000; // size cap *per prompt* (incl. instructions)
const TOKEN_RATIO = 0.25; // ~4 characters ≈ 1 token

/* ------------------  helpers  ------------------ */
const looksGenerated = (txt) => txt.includes('Auto-generated');
const estimateTokens = (chars) => Math.ceil(chars * TOKEN_RATIO);
const ensureDir = (dir) => fs.mkdir(dir, { recursive: true }).catch(() => {});
const slug = (str) => str.replace(/[^a-z0-9_-]/gi, '-').replace(/^-+|-+$/g, '');

/* Between CREATE PROCEDURE … and AS ► parameter block */
const extractParamsBlock = (sql) => {
  const m = sql.match(/create\s+procedure[\s\S]+?\s+as\b/i);
  if (!m) return '';
  const [, paramsZone = ''] = m[0].split(/\bAS\b/i, 2);
  return paramsZone;
};

const formatParamLines = (block) =>
  block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((p) => ` * @param ${p.replace(/^\@/, '').replace(/\s*--.*/, '')}`)
    .join('\n');

/* very crude “strip everything up to AS …” – good enough for prompt */
const stripTemplateStuff = (sql) => {
  // keep text after first   AS
  const [, afterAs = ''] = sql.split(/\bAS\b/i, 2);

  // stop at   '')'   or   SET @SQL …   whichever appears first
  const endRE = /\n\s*(?:\)''|SET\s+@SQL\b)/i;
  const stopIdx = afterAs.search(endRE);
  const body = stopIdx === -1 ? afterAs : afterAs.slice(0, stopIdx);

  return body.trimEnd(); // no other alterations!
};

/* ------------------  core  ------------------ */
export async function preparePrompts() {
  await ensureDir(PROMPT_DIR);

  /* 1. gather candidate sources */
  const dirEntries = await fs.readdir(SQL_DIR, { withFileTypes: true });
  const sources = [];

  for (const d of dirEntries) {
    if (!d.isFile() || !d.name.endsWith('.ts')) continue;

    const fullPath = path.join(SQL_DIR, d.name);
    const raw = await fs.readFile(fullPath, 'utf8');
    if (!looksGenerated(raw)) continue;

    const procName = d.name.replace(/\.ts$/, '');
    const paramsBlock = extractParamsBlock(raw);
    const paramsJSDoc = paramsBlock ? formatParamLines(paramsBlock) : ' * (no parameters)';
    const pureSQL = stripTemplateStuff(raw);

    const rawConst = raw.trimEnd();

    sources.push({
      name: procName,
      rawConst,
      charCount: rawConst.length,
      tokenCount: estimateTokens(rawConst.length),
    });

    // const cleanedConst = [
    //   "/**",
    //   paramsJSDoc,
    //   " */",
    //   `export const ${procName} = \`\n${pureSQL}\n\`;`
    // ].join("\n");

    // sources.push({
    //   name:        procName,
    //   cleanedConst,
    //   charCount:   cleanedConst.length,
    //   tokenCount:  estimateTokens(cleanedConst.length)
    // });
  }

  if (!sources.length) {
    console.log('⚠️  No auto-generated TS files found. Nothing written.');
    return [];
  }

  /* 2. bucket by token budget */
  const buckets = [];
  let current = [];
  let usedToks = 0;

  for (const src of sources.sort((a, b) => a.tokenCount - b.tokenCount)) {
    if (usedToks + src.tokenCount > MAX_TOKENS && current.length) {
      buckets.push(current);
      current = [];
      usedToks = 0;
    }
    current.push(src);
    usedToks += src.tokenCount;
  }
  if (current.length) buckets.push(current);

  /* 3. write prompt JSON files */
  const results = [];

  await Promise.all(
    buckets.map(async (group) => {
      const first = group[0].name,
        last = group[group.length - 1].name;
      const promptFile =
        group.length === 1 ? `${slug(first)}.json` : `${slug(first)}-${slug(last)}.json`;

      const userInstructions = `
You will receive auto-generated TypeScript constants that wrap SQL
stored-procedure definitions. For each:

For each constant you receive:
1. Locate the \`CREATE PROCEDURE … AS\` section and derive the @param list as a jsDoc comment like in sample.
2. Remove *all* dynamic-SQL scaffolding (\`SET @TEMPLATE = …\`, doubled quotes, etc.).
3. Keep only the SQL body between \`AS\` and the end of that procedure.
4. Emit:
   \`\`\`ts
   /**
    * @param foo INT
    * …
    */
   export const <sameName> = \`
   -- cleaned SQL here
   \`;
   \`

Return only the cleaned constants – no commentary.
      `.trim();

      const userBlob =
        userInstructions +
        '\n\n---\n\n' +
        group.map((g) => `/**FILE:${g.name}.ts*/\n${g.rawConst}`).join('\n\n---\n\n');

      const promptJSON = {
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are an expert SQL & TypeScript refactorer.' },
          { role: 'user', content: userBlob },
        ],
      };

      const outPath = path.join(PROMPT_DIR, promptFile);
      await fs.writeFile(outPath, JSON.stringify(promptJSON, null, 2), 'utf8');

      results.push({
        promptPath: path.relative(ROOT, outPath),
        procedures: group.map((g) => g.name),
        tokenEstimate: group.reduce((s, g) => s + g.tokenCount, 0),
      });
      console.log(`📝  wrote ${outPath}`);
    })
  );

  console.log(`\n✅  Prepared ${results.length} prompt file${results.length > 1 ? 's' : ''}.`);
  return results;
}

/* ---------------  CLI entry --------------- */
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  preparePrompts()
    .then((arr) => {
      console.log('\nProcessed summary:\n', JSON.stringify(arr, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

/* helper for CLI check */
function pathToFileURL(p) {
  return new URL(`file://${path.resolve(p)}`);
}
