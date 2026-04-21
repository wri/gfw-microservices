/**
 * @jest-environment node
 */

/* eslint-disable global-require */

const mockGetObject = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3: jest.fn().mockImplementation(() => ({
    getObject: mockGetObject,
  })),
}));

describe('load-env getDataFromS3 error propagation', () => {
  let loadEnvironmentVars;
  let errorSpy;

  beforeEach(() => {
    jest.resetModules();
    mockGetObject.mockReset();
    ({ loadEnvironmentVars } = require('../load-env'));
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('rejects when S3 getObject calls back with an error (used to silently hang)', async () => {
    mockGetObject.mockImplementationOnce((params, cb) => {
      cb(new Error('access denied'), null);
    });

    await expect(loadEnvironmentVars('qa')).rejects.toThrow('access denied');
    expect(errorSpy).toHaveBeenCalledWith('Failed to load env from S3', expect.any(String));
  });

  it('rejects when transformToString() throws', async () => {
    mockGetObject.mockImplementationOnce((params, cb) => {
      cb(null, {
        Body: { transformToString: () => Promise.reject(new Error('bad body')) },
      });
    });

    await expect(loadEnvironmentVars('qa')).rejects.toThrow('bad body');
    expect(errorSpy).toHaveBeenCalledWith('Failed to read S3 env body', expect.any(String));
  });

  it('resolves true in development without calling S3', async () => {
    await expect(loadEnvironmentVars('development')).resolves.toBe(true);
    expect(mockGetObject).not.toHaveBeenCalled();
  });
});
