import signedURL from '../utils/dataApi.utils';

const loadenv = require('../../../load-env');

describe('Testing presignedURL', () => {
  beforeEach(async () => {
    await loadenv.loadEnvironmentVars('development');
  });

  it('should return a presigned url', async () => {
    const url = await signedURL('test.txt', 'text/plain');
    expect(url).toContain(`https://${process.env.LARGE_PROCESING_LIST_BUCKET}.s3.amazonaws.com`);
  });
});
