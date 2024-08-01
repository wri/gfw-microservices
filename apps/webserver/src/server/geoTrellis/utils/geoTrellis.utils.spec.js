const axios = require('axios');
const path = require('path');
const { handleGeoTrellisAnalyzeListRequest } = require('./geoTrellis.utils');

// Mocking axios
jest.mock('axios');

// Mocking logger and AWSSES functions
jest.mock(path.resolve('./config/privateutils/logger.utils'));
jest.mock(path.resolve('./config/privateutils/ses.utils'));

// Mocking functions
// Use the real module, replace the function we want to mock using spread.
jest.mock('@wri-monorepos/shared', () => ({
  ...jest.requireActual('@wri-monorepos/shared'),
  checkProcessingLimits: async () => {
    return {
      isListLocationOverLimit: true,
      processingLimit: 1000000000000,
    };
  },
}));

jest.mock('@wri-monorepos/geo', () => ({
  ...jest.requireActual('@wri-monorepos/geo'),
  getListAnalysisStatus: async () => {
    return [
      {
        listId: 123,
        analysisId: 'FCD',
        status: 1,
        errorInfo: null,
        updateTime: null,
      },
    ];
  },
}));

jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  updateListsAnalysisStatus: async () => {
    return {
      isListLocationOverLimit: true,
      processingLimi: 10000000000,
    };
  },
}));

describe('handleGeoTrellisAnalyzeListRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shoul throw error when analysis limit is reached', async () => {
    // Mock dependencies and axios response for successful submission
    const req = {
      session: {
        /* mock session data */
      },
      body: {
        reanalyze: true,
      },
    };
    const list = {
      id: 123,
      list_name: 'List test name',
    };

    const expectedResult = {
      executionArn:
        'arn:aws:states:us-east-1:617001639586:execution:Pre-Geotrellis-ETL-LATEST:560b5378-7175-4ee0-99f1-447213fe4290',
      startDate: 1.713786341132e9,
    };

    axios.mockResolvedValue({ data: expectedResult });

    expect(async () => {
      await handleGeoTrellisAnalyzeListRequest(req, list);
    }).rejects.toThrow('Analysis limit reached');

    // Below line is for another unit test to resolve, refactor probably will be needed
    // await expect(response).resolves.toEqual(expectedResult);
  });
});
