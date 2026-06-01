/**
 * @jest-environment node
 */

import { expect, describe, it, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Stub microservice URLs to empty so getAllCommits exercises the "N/A" branch
// deterministically (previously flaked when a local LP microservice happened
// to be listening on LISTS_MICROSERVICE_URL).
const ORIGINAL_ENV = {
  LD_MICROSERVICE_URL: process.env.LD_MICROSERVICE_URL,
  LISTS_MICROSERVICE_URL: process.env.LISTS_MICROSERVICE_URL,
  EAPI_MICROSERVICE_URL: process.env.EAPI_MICROSERVICE_URL,
};

const axios = require('axios').default;

beforeAll(() => {
  delete process.env.LD_MICROSERVICE_URL;
  delete process.env.LISTS_MICROSERVICE_URL;
  delete process.env.EAPI_MICROSERVICE_URL;
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

const adminController = require('./admin.controller');

describe('Latest Commit', () => {
  it('getCommitForSerivce bad service returns N/A', async () => {
    axios.get.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await adminController.getCommitForSerivce('http://localhost:9');

    expect(axios.get).toHaveBeenCalledWith('http://localhost:9/latest_commit');
    expect(res).toBe('N/A');
  });

  it('getCommitForSerivce no service returns N/A', async () => {
    const res = await adminController.getCommitForSerivce();
    expect(res).toBe('N/A');
  });

  it('getAllCommits', async () => {
    const res = await adminController.getAllCommits();
    expect(res).toEqual({
      EAPI: 'N/A',
      LD: 'N/A',
      LP: 'N/A',
      WEB: 'dev',
    });
  });
});
