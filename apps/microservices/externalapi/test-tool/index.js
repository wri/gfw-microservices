const axios = require('axios');

// Define default values for parameters
const defaultBaseUrl = 'http://localhost:3336';
let baseUrl = defaultBaseUrl;

// Parse command-line arguments for custom parameters
// The following fragment will handle more params in the future, for the moment we just accept BASEURL
// usage: node index.js --BASEURL=http://otherurl:3336
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const [paramName, paramValue] = arg.slice(2).split('=');
    if (paramName === 'BASEURL' && paramValue) {
      baseUrl = paramValue;
    }
    // Add more conditions for other parameters as needed
  }
}

const TEST_CREATE_ORGANIZATION_ID = 123; // Replace with your organization ID
const TEST_CREATE_USER_ID = 456; // Replace with your user ID
const TEST_DELETE_ORGANIZATION_ID = 123; // Replace with your organization ID
const TEST_DELETE_API_KEY_ID = 'abc123'; // Replace with your token ID
const TEST_GET_ANALYSIS_ID = 123; // Replace with your analysis ID

// Define the list of endpoints with their corresponding HTTP verbs and request schemas (if needed)
const endpointsToTest = [
  {
    path: '/api/HealthCheck',
    method: 'get',
    requestSchema: null,
  },
  {
    path: '/api/api-keys/123',
    method: 'get',
    requestSchema: null,
  },
  {
    path: '/api/api-keys',
    method: 'post',
    requestSchema: {
      organizationId: TEST_CREATE_ORGANIZATION_ID, // Replace with your organization ID
      userId: TEST_CREATE_USER_ID, // Replace with your user ID
    },
  },
  {
    path: `/api/api-keys/${TEST_DELETE_ORGANIZATION_ID}/${TEST_DELETE_API_KEY_ID}`,
    method: 'delete',
    requestSchema: null,
  },
  {
    path: `/api/v1/list/${TEST_GET_ANALYSIS_ID}/analysis/FCD/status`,
    method: 'get',
    requestSchema: null,
  },
  {
    path: '/api/v1/list-upload',
    method: 'post',
    requestSchema: {
      uploadId: 'abc123', // Replace with your upload ID
      listName: 'MyList', // Replace with your list name
      templateId: 'template123', // Replace with your template ID
      analysisIDs: 'analysis123', // Replace with your analysis IDs
    },
  },
  // Add more endpoints in the future
];

// Function to make requests to the API endpoints
async function testEndpoints() {
  for (const { path, method, requestSchema } of endpointsToTest) {
    const url = `${baseUrl}${path}`;

    try {
      let response;
      if (method === 'post') {
        response = await axios.post(url, requestSchema);
      } else {
        response = await axios.get(url);
      }

      console.log(`Endpoint: ${url}`);
      console.log(`HTTP Method: ${method.toUpperCase()}`);
      console.log(`Status Code: ${response.status}`);
      console.log('Response Body:', response.data);
      console.log('-------------------------------------------');
    } catch (error) {
      console.error(`Error while testing endpoint: ${url}`);
      console.error(`HTTP Method: ${method.toUpperCase()}`);
      console.error('Error:', error.message);
      console.error('-------------------------------------------');
    }
  }
}

// Start testing the endpoints
testEndpoints();
