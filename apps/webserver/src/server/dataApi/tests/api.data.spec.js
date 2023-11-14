/**
 * @jest-environment node
 */
// The above overrides 'testEnvironment' setting in jest.config.json to allow nodeJS server environment
// because this code triggers log that requires setImmediate

// setup axios to match what palm oil mill test expects
jest.mock('axios', () => async () => ({
  data: { data: 'whatever' },
  status: 200,
}));
jest.mock('axios-retry', () => () => null);
import dataApiCtrl from '../controllers/dataApi.controller';

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
