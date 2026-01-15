/**
 * Helper script to find a valid test list for e2e tests
 *
 * This script searches for lists that have all required analyses (DefReport, FCD, Alerts)
 * completed AND not expired.
 *
 * Run this to identify a valid list ID for TEST_LIST environment variable
 *
 * Usage:
 *   HOST=https://pro-qa.globalforestwatch.org API_TOKEN=your_token_here npx ts-node -P apps/microservices/externalapi-e2e/tsconfig.json apps/microservices/externalapi-e2e/src/support/find-valid-test-list.ts
 *
 * Example:
 *   HOST=https://pro-qa.globalforestwatch.org API_TOKEN=da0fkg... npx ts-node -P apps/microservices/externalapi-e2e/tsconfig.json apps/microservices/externalapi-e2e/src/support/find-valid-test-list.ts
 */

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;

if (!BASE_URL || !API_TOKEN) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   HOST and API_TOKEN must be set');
  console.error('\nUsage:');
  console.error(
    '   HOST=https://pro-qa.globalforestwatch.org API_TOKEN=your_token npx ts-node ...'
  );
  process.exit(1);
}

interface ListResponse {
  listId: number;
  listName: string;
  locationCount: number;
  status?: string;
}

interface AnalysisStatusResponse {
  status: string;
  listId?: string;
  resultUrl?: string;
  creationDate?: string;
  expirationDate?: string;
}

async function checkAnalysisStatus(
  listId: number,
  analysisType: string
): Promise<{ completed: boolean; expired: boolean }> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/list/${listId}/analysis/${analysisType}/status`,
      {
        method: 'GET',
        headers: {
          'x-api-key': API_TOKEN,
        },
      }
    );

    if (!response.ok) {
      return { completed: false, expired: false };
    }

    const result: AnalysisStatusResponse = await response.json();

    // Check if analysis is completed
    const isCompleted = result.status === 'Completed';

    // Check if analysis has expired
    let isExpired = false;
    if (result.expirationDate) {
      const expirationTime = new Date(result.expirationDate);
      const now = new Date();
      isExpired = now > expirationTime;
    }

    return { completed: isCompleted, expired: isExpired };
  } catch (error) {
    return { completed: false, expired: false };
  }
}

async function findValidTestList(): Promise<number | null> {
  console.log(`\n🔍 Searching for valid test lists in ${BASE_URL}...\n`);

  try {
    // Fetch lists
    const response = await fetch(`${BASE_URL}/api/v1/list?pageSize=100&pageNum=0`, {
      method: 'GET',
      headers: {
        'x-api-key': API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lists: ${response.status}`);
    }

    const lists: ListResponse[] = await response.json();

    console.log(`📋 Found ${lists.length} lists total\n`);

    // Required analyses for e2e tests
    const requiredAnalyses = ['DefReport', 'FCD', 'Alerts'];

    // Check each list
    for (const list of lists) {
      console.log(`Checking List ID ${list.listId}: "${list.listName}"...`);

      const analysisResults: Record<string, { completed: boolean; expired: boolean }> = {};
      for (const analysisType of requiredAnalyses) {
        const status = await checkAnalysisStatus(list.listId, analysisType);
        analysisResults[analysisType] = status;
      }

      const allCompleted = Object.values(analysisResults).every((v) => v.completed);
      const anyExpired = Object.values(analysisResults).some((v) => v.expired);

      console.log(
        `  - DefReport: ${
          analysisResults.DefReport.completed
            ? analysisResults.DefReport.expired
              ? '⚠️  (EXPIRED)'
              : '✅'
            : '❌'
        }`
      );
      console.log(
        `  - FCD: ${
          analysisResults.FCD.completed
            ? analysisResults.FCD.expired
              ? '⚠️  (EXPIRED)'
              : '✅'
            : '❌'
        }`
      );
      console.log(
        `  - Alerts: ${
          analysisResults.Alerts.completed
            ? analysisResults.Alerts.expired
              ? '⚠️  (EXPIRED)'
              : '✅'
            : '❌'
        }`
      );

      if (allCompleted && !anyExpired) {
        console.log(`\n✅ FOUND VALID TEST LIST!`);
        console.log(`\n📝 Update your configuration with:`);
        console.log(`   process.env.TEST_LIST = '${list.listId}';`);
        console.log(`\nOr update GitHub secret EAPI_E2E_SETTINGS with list ID: ${list.listId}\n`);
        return list.listId;
      } else if (allCompleted && anyExpired) {
        console.log(`  ⚠️  All analyses exist but some have expired. Run analyses again.\n`);
      } else {
        console.log(`  ⚠️  Missing analyses, skipping...\n`);
      }
    }

    console.log(
      '❌ No valid test lists found with all required analyses (completed and not expired).\n'
    );
    console.log('💡 Suggestions:');
    console.log('   1. Choose an existing list and run the required analyses');
    console.log('   2. If analyses are expired, regenerate them using:');
    console.log(
      '      curl -L --post302 -H "x-api-key: TOKEN" -H "Content-Type: application/json" \\'
    );
    console.log('        -X POST -d \'{"userEmail": "email@example.com"}\' \\');
    console.log('        "BASE_URL/api/v1/list/LIST_ID/analysis/ANALYSIS_TYPE/analyze"');
    console.log('   3. Create a new test list specifically for e2e tests\n');

    return null;
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Run the script
findValidTestList()
  .then((listId) => {
    if (!listId) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
