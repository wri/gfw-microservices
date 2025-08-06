/**
 * @jest-environment node
 */

const locationsController = require('./locations.controller');
import { expect, describe, it } from '@jest/globals';

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getUserListsWithAnalysisId: jest.fn(),
  getLocationsCount: jest.fn(),
  getAllListsWithAnalysisId: () => Promise.resolve([{ id: 'notShared' }, { id: 'shared1' }]),
}));

jest.mock('../../../config/publicutils/authenticationManager.utils', () => ({
  getUserInfo: jest.fn(),
}));

jest.mock('../../../config/publicutils/gfwListManager.utils', () => ({
  getGFWLists: jest.fn(),
}));

jest.mock('../../../config/publicutils/shareManager.utils', () => ({
  ...jest.requireActual('../../../config/publicutils/shareManager.utils'),
  getUserInternalShareLists: () => Promise.resolve([{ list_id: 'shared1' }]),
}));

jest.mock('../../../config/publicutils/accountManager.utils', () => ({
  getUsersList: jest.fn(),
}));

describe('locations controller', () => {
  it('shared lists is an empty array for admins', async () => {
    const req = {
      session: {
        user_access_level_id: 1, // Admin
      },
    };
    const res = {
      status: (status) => {
        expect(status).toBe(200);
        return res;
      },
      send: (data) => {
        expect(data).toHaveProperty('userSharedLists');
        expect(data.userSharedLists).toBeDefined();
        expect(Array.isArray(data.userSharedLists)).toBe(true);
        expect(data.userSharedLists.length).toBe(0);
      },
    };
    await locationsController.locationsData(req, res);
  });

  it('shared lists has valid entry for viewers', async () => {
    const req = {
      session: {
        user_access_level_id: 3, // Viewer
      },
    };
    const res = {
      status: (status) => {
        expect(status).toBe(200);
        return res;
      },
      send: (data) => {
        expect(data).toHaveProperty('userSharedLists');
        expect(data.userSharedLists).toBeDefined();
        expect(Array.isArray(data.userSharedLists)).toBe(true);
        expect(data.userSharedLists.length).toBe(1);
        expect(data.userSharedLists[0].id).toBe('shared1');
      },
    };
    await locationsController.locationsData(req, res);
  });
});
