// setup axios to match what palm oil mill test expects
jest.mock('axios', () => async () => ({
  data: { data: 'whatever' },
  status: 200,
}));
jest.mock('axios-retry', () => () => null);
import signedURL from '../utils/dataApi.utils';
import dataApiCtrl from '../controllers/dataApi.controller';

const loadenv = require('../../../load-env');

describe('Testing presignedURL', () => {
  beforeEach(async () => {
    await loadenv.loadEnvironmentVars('development');
  });

  // disabling because process.env.* is not defined in github test environment
  xit('should return a presigned url', async () => {
    const url = await signedURL('test.txt', 'text/plain');
    expect(url).toContain(`https://${process.env.LARGE_PROCESING_LIST_BUCKET}.s3.amazonaws.com`);
  });
});

describe('DataAPI endpoints', () => {
  it('palm oil mill Id to lat/long', (done) => {
    const chunkSize = 100;
    // one more than chunkSize to ensure two chunks
    const palmOilMillIDs = [...Array(chunkSize + 1)].map((_, idx) => 'i' + idx);
    const req = { body: { palmOilMillIDs } };
    const res = {
      status: (statusCode) => {
        expect(statusCode).toBe(200);
        return {
          json: (jsonData) => {
            expect(jsonData).toBeTruthy();
            expect(jsonData.data).toBeTruthy();
            expect(jsonData.data.length).toBe(Math.ceil(palmOilMillIDs.length / chunkSize));
            done();
          },
        };
      },
    };
    dataApiCtrl.getPalmOilMillLatLong(req, res);
  });
});
