const axios = require('axios');
const fs = require('fs');

const { ArgumentParser } = require('argparse');
const parser = new ArgumentParser({
  description: 'Upload multiple files to GFW Pro and monitor analysis status',
});
parser.addArgument(['-k', '--apiKey'], { help: 'API key for authentication' });
parser.addArgument(['-u', '--url'], {
  help: 'API endpoint URL e.g.: "https://pro-qa.globalforestwatch.org/api/v1"',
});
parser.addArgument(['-e', '--email'], { help: 'Email address for user identification' });
parser.addArgument(['-c', '--csv'], { help: 'Path to the CSV file' });
parser.addArgument(['-n', '--numUploads'], { help: 'Number of concurrent uploads (default 2)' });
const args = parser.parseArgs();

const API_KEY = args.apiKey;
const BASE_URL = args.url;
const USER_EMAIL = args.email;
const CSV_FILE = args.csv;
if (!API_KEY || !BASE_URL || !USER_EMAIL || !CSV_FILE) {
  console.error('Missing required arguments: --apiKey, --url, --email, --csv');
  process.exit(1);
}
const CONCURRENT_REQUESTS = Number(args.numUploads) || 2; // Default to 2 if not provided

const ANALYSIS_IDS = ['DefReport', 'FCD', 'GHG', 'Alerts'];
const COMMODITY = 'Soy';

// Colors for output
const colors = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  NC: '\x1b[0m',
};

function colorLog(color, ...args) {
  console.log(color, new Date().toLocaleTimeString(), ...args, colors.NC);
}

async function postRedirectHeaders(url, body, headers) {
  try {
    return await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
    });
  } catch (error) {
    if (error.response?.status === 302) {
      return postRedirectHeaders(error.response.headers.location, body, headers);
    } else {
      throw error;
    }
  }
}

async function deleteList(LIST_ID, LIST_NAME, processId) {
  colorLog(colors.GREEN, `[Process ${processId}] Deleting list with ID: ${LIST_ID}`);
  try {
    await postRedirectHeaders(
      `${BASE_URL}/list/${LIST_ID}/delete`,
      {
        userEmail: USER_EMAIL,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'x-trace-id': LIST_NAME,
          'Content-Type': 'application/json',
        },
      }
    );
    colorLog(colors.GREEN, `[Process ${processId}] List deleted successfully`);
  } catch (err) {
    colorLog(
      colors.RED,
      `[Process ${processId}] Error: Failed to delete list`,
      err.response?.data || err.message
    );
  }
}

async function runSingleUpload(processId) {
  const LIST_NAME = `test_multi_upload_${processId}_${new Date()
    .toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/[^\d_]/g, '_')}`;
  const ANALYSIS_ID = ANALYSIS_IDS[(processId - 1) % ANALYSIS_IDS.length];

  colorLog(colors.BLUE, `[Process ${processId}] Starting upload process...`);
  colorLog(colors.GREEN, `[Process ${processId}] List Name: ${LIST_NAME}`);

  // Step 1: Prepare upload
  colorLog(colors.YELLOW, `[Process ${processId}] Step 1: Preparing upload...`);
  let prepareResp;
  try {
    prepareResp = await postRedirectHeaders(
      `${BASE_URL}/prepare_upload`,
      {
        userEmail: USER_EMAIL,
        fileType: 'csv',
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'x-trace-id': LIST_NAME,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    colorLog(
      colors.RED,
      `[Process ${processId}] Error: Failed to prepare upload`,
      err.response?.data || err.message
    );
    return false;
  }

  const { uploadId: UPLOAD_ID, uploadUrl: UPLOAD_URL } = prepareResp.data || {};
  if (!UPLOAD_ID || !UPLOAD_URL) {
    colorLog(colors.RED, `[Process ${processId}] Error: Could not extract uploadId or uploadUrl`);
    return false;
  }
  colorLog(colors.GREEN, `[Process ${processId}] Upload ID: ${UPLOAD_ID}`);

  // Step 2: Upload CSV file
  colorLog(colors.YELLOW, `[Process ${processId}] Step 2: Uploading CSV file...`);
  if (!fs.existsSync(CSV_FILE)) {
    colorLog(colors.RED, `[Process ${processId}] Error: CSV file not found at ${CSV_FILE}`);
    return false;
  }
  try {
    const fileData = fs.readFileSync(CSV_FILE, { encoding: 'utf8', flag: 'r' });
    await axios.put(UPLOAD_URL, fileData, {
      headers: {
        'Content-Type': 'text/csv',
        'x-trace-id': LIST_NAME,
      },
    });
  } catch (err) {
    colorLog(
      colors.RED,
      `[Process ${processId}] Error: Failed to upload CSV file`,
      err.response?.data || err.message
    );
    return false;
  }
  colorLog(colors.GREEN, `[Process ${processId}] CSV file uploaded successfully`);

  // Step 3: Upload the list
  colorLog(colors.YELLOW, `[Process ${processId}] Step 3: Creating list...`);
  let listResp;
  try {
    listResp = await postRedirectHeaders(
      `${BASE_URL}/list/upload_new`,
      {
        userEmail: USER_EMAIL,
        uploadId: UPLOAD_ID,
        listName: LIST_NAME,
        analysisIDs: ANALYSIS_ID,
        commodity: COMMODITY,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'x-trace-id': LIST_NAME,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    colorLog(
      colors.RED,
      `[Process ${processId}] Error: Failed to create list`,
      err.response?.data || err.message
    );
    return false;
  }
  const { listId: LIST_ID } = listResp.data || {};
  if (!LIST_ID) {
    colorLog(colors.RED, `[Process ${processId}] Error: Could not extract listId`);
    return false;
  }
  colorLog(colors.GREEN, `[Process ${processId}] List ID: ${LIST_ID}`);

  // Step 4: Monitor status
  colorLog(colors.YELLOW, `[Process ${processId}] Step 4: Monitoring analysis status...`);
  let status = 'Pending';
  let counter = 0;
  const MAX_ATTEMPTS = 30; // Check every minute for up to 30 minutes

  while (status === 'Pending' && counter < MAX_ATTEMPTS) {
    colorLog(colors.BLUE, `[Process ${processId}] Checking status... (attempt ${counter + 1})`);
    let statusResp;
    try {
      statusResp = await axios.get(`${BASE_URL}/list/${LIST_ID}/analysis/${ANALYSIS_ID}/status`, {
        headers: {
          'x-api-key': API_KEY,
          'x-trace-id': LIST_NAME,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      colorLog(
        colors.RED,
        `[Process ${processId}] Error: Failed to check status`,
        err.response?.data || err.message
      );
      return false;
    }
    status = (statusResp.data && statusResp.data.status) || 'Pending';
    colorLog(colors.BLUE, `[Process ${processId}] Current status: ${status}`);

    if (status === 'Completed') {
      colorLog(colors.GREEN, `[Process ${processId}] Analysis completed!`);
      const resultUrl = statusResp.data.resultUrl;
      if (resultUrl) {
        colorLog(colors.GREEN, `[Process ${processId}] Result URL: ${resultUrl}`);
        colorLog(
          colors.YELLOW,
          `[Process ${processId}] Download: curl -o results_${processId}.zip '${resultUrl}'`
        );
      }
      await deleteList(LIST_ID, LIST_NAME, processId);
      return true;
    } else if (status === 'Failed' || status === 'Error') {
      colorLog(colors.RED, `[Process ${processId}] Analysis failed!`);
      colorLog(colors.RED, `[Process ${processId}] Response:`, JSON.stringify(statusResp.data));
      return false;
    }
    counter++;
    await new Promise((res) => setTimeout(res, 60 * 1000)); // 1 minute delay
  }

  if (counter === MAX_ATTEMPTS) {
    colorLog(colors.RED, `[Process ${processId}] Timeout: Analysis still pending`);
    return false;
  }
  return true;
}

async function main() {
  colorLog(colors.GREEN, `Starting ${CONCURRENT_REQUESTS} concurrent GFW Pro upload processes...`);
  const promises = [];
  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    colorLog(colors.BLUE, `Starting process ${i}...`);
    // Stagger start by 5 seconds to avoid overwhelming the server
    await new Promise((res) => setTimeout(res, 5 * 1000));
    promises.push(runSingleUpload(i));
  }
  const results = await Promise.all(promises);
  const successCount = results.filter(Boolean).length;
  const failedCount = CONCURRENT_REQUESTS - successCount;

  // Summary
  colorLog(colors.BLUE, '=== SUMMARY ===');
  colorLog(colors.GREEN, `Successful processes: ${successCount}`);
  colorLog(colors.RED, `Failed processes: ${failedCount}`);
  colorLog(colors.YELLOW, `Total processes: ${CONCURRENT_REQUESTS}`);

  if (successCount === CONCURRENT_REQUESTS) {
    colorLog(colors.GREEN, 'All processes completed successfully!');
    process.exit(0);
  } else {
    colorLog(colors.YELLOW, 'Some processes failed. Check the logs above for details.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(colors.RED, 'An unexpected error occurred:', err);
  process.exit(1);
});
