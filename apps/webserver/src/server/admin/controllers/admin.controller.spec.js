/**
 * @jest-environment node
 */

const adminController = require('./admin.controller');
import { expect, describe, it } from '@jest/globals';

describe('Latest Commit', () => {
  it('getCommitForSerivce bad service returns N/A', async () => {
    const res = await adminController.getCommitForSerivce('http://localhost:9');
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
