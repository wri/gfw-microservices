/**
 * @jest-environment node
 */

const express = require('express');
const request = require('supertest');

jest.mock('../../../config/publicutils/middlewares', () => ({
  checkAuthentication: (req, res, next) => next(),
  checkOrganization: (req, res, next) => next(),
  checkActive: (req, res, next) => next(),
  checkInactivity: (req, res, next) => next(),
  rateLimitAuthenticated: {},
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: () => false,
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../../config/publicutils/folderManager.utils', () => ({
  getAllFolders: jest.fn(),
  createNewFolder: jest.fn(),
  getFolderDetails: jest.fn(),
  addListToFolder: jest.fn(),
  removeListFromFolder: jest.fn(),
  moveListToFolder: jest.fn(),
  updateFolderName: jest.fn(),
  updateFolderAccessTime: jest.fn(),
  deleteFolder: jest.fn(),
}));

jest.mock('../../../config/langResources', () => ({
  getResourceString: (key) => `lang:${key}`,
}));

const FolderManager = require('../../../config/publicutils/folderManager.utils');
const logger = require('../../../config/privateutils/logger.utils');
const folderRoutes = require('../routes/folders.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  folderRoutes(app, null);
  return app;
};

describe('folders.routes error handling', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('error status differentiation', () => {
    it('returns 422 with userMessage when a known error is thrown', async () => {
      const knownErr = Object.assign(new Error('boom'), { userMessage: 'Folder is locked' });
      FolderManager.getAllFolders.mockRejectedValueOnce(knownErr);

      const res = await request(app).get('/folder');

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'Folder is locked' });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('returns 500 and logs when an unknown error is thrown', async () => {
      FolderManager.getAllFolders.mockRejectedValueOnce(new Error('db exploded'));

      const res = await request(app).get('/folder');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith('GET /folder', expect.any(String));
    });

    it('returns 500 on POST /folder when FolderManager throws a generic error', async () => {
      FolderManager.createNewFolder.mockRejectedValueOnce(new Error('db down'));

      const res = await request(app).post('/folder').send({ name: 'my folder' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith('POST /folder', expect.any(String));
    });

    it('returns 422 on POST /folder when createNewFolder resolves falsy', async () => {
      FolderManager.createNewFolder.mockResolvedValueOnce(null);

      const res = await request(app).post('/folder').send({ name: 'my folder' });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'Unkown error creating folder' });
    });

    it('keeps 422 validation responses for missing body fields', async () => {
      const res = await request(app).post('/folder').send({});

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'lang:missingFolderName' });
      expect(FolderManager.createNewFolder).not.toHaveBeenCalled();
    });

    it('returns 500 on remove_lists generic failure', async () => {
      FolderManager.removeListFromFolder.mockRejectedValueOnce(new Error('db down'));

      const res = await request(app)
        .post('/folder/1/remove_lists')
        .send({ list_ids: [1, 2] });

      expect(res.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'POST /folder/:folder_id/remove_lists',
        expect.any(String)
      );
    });

    it('returns 500 on delete_folder generic failure', async () => {
      FolderManager.deleteFolder.mockRejectedValueOnce(new Error('db down'));

      const res = await request(app).delete('/folder/1/delete_folder');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith(
        'DELETE /folder/:folder_id/delete_folder',
        expect.any(String)
      );
    });

    it('returns 422 on delete_folder when userMessage is present', async () => {
      FolderManager.deleteFolder.mockRejectedValueOnce(
        Object.assign(new Error('boom'), { userMessage: 'Cannot delete' })
      );

      const res = await request(app).delete('/folder/1/delete_folder');

      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'Cannot delete' });
    });
  });
});
