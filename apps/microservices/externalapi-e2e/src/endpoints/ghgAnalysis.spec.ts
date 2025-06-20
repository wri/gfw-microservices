import axios from 'axios';
import fs from 'fs';
import path from 'path';
import postRedirectHeaders from './postRedirectHeaders';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;

describe('GHGAnalysis', () => {
  let prepareUploadRes;
  let uploadNewRes;
  const deleteList = async (listId) => {
    await postRedirectHeaders(
      `${BASE_URL}/api/v1/list/${listId}/delete`,
      {
        userEmail: email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_TOKEN,
        },
      }
    );
  };

  it(
    'should prepare an upload',
    async () => {
      prepareUploadRes = await postRedirectHeaders(
        `${BASE_URL}/api/v1/prepare_upload`,
        {
          userEmail: email,
          fileType: 'csv',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
        }
      );

      expect(prepareUploadRes.status).toBe(201);
      expect(prepareUploadRes.data).toHaveProperty('uploadUrl');
      expect(prepareUploadRes.data).toHaveProperty('uploadId');
      expect(prepareUploadRes.data).toHaveProperty('uploadDateTime');
      expect(typeof prepareUploadRes.data.uploadUrl).toBe('string');
      expect(typeof prepareUploadRes.data.uploadId).toBe('string');
      expect(typeof prepareUploadRes.data.uploadDateTime).toBe('string');
    },
    10 * 1000
  );
  it(
    'should upload input file for a new list',
    async () => {
      const uploadUrl = prepareUploadRes.data.uploadUrl;
      const fileRelPath = '../../../externalapi/test-tool/CocoaGeneric3.csv';
      const filePath = path.join(__dirname, fileRelPath);
      const fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
      const fileUploadRes = await axios.put(uploadUrl, fileData, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });

      expect(fileUploadRes.status).toBe(200);
    },
    10 * 1000
  );
  it(
    'should create new list with uploaded input',
    async () => {
      const uploadId = prepareUploadRes.data.uploadId;
      const listName = `e2e_automation_${new Date().toISOString().replace(/\./g, '')}`;
      uploadNewRes = await postRedirectHeaders(
        `${BASE_URL}/api/v1/list/upload_new`,
        {
          uploadId,
          listName,
          commodity: 'Cocoa Generic',
          analysisIDs: 'FCD',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
        }
      );

      expect(uploadNewRes.status).toBe(201);
      expect(uploadNewRes.data).toBeTruthy();
      expect(uploadNewRes.data).toHaveProperty('uploadId');
      expect(uploadNewRes.data).toHaveProperty('listId');
      expect(uploadNewRes.data).toHaveProperty('status');
      expect(uploadNewRes.data).toHaveProperty('errorDetails');
      expect(uploadNewRes.data).toHaveProperty('creationDate');
      expect(typeof uploadNewRes.data.uploadId).toBe('string');
      expect(typeof uploadNewRes.data.listId).toBe('string');
      expect(typeof uploadNewRes.data.status).toBe('string');
      expect(typeof uploadNewRes.data.errorDetails).toBe('string');
      expect(typeof uploadNewRes.data.creationDate).toBe('string');
    },
    40 * 1000
  );
  it(
    'Should fail to generate an GHG Analysis for the list without commodity specified',
    async () => {
      try {
        await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${uploadNewRes.data.listId}/analysis/GHG/analyze`,
          {
            userEmail: email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Request failed with status code 400');
        deleteList(uploadNewRes.data.listId);
      }
    },
    40 * 1000
  );
  it(
    'should prepare an upload for list with yield',
    async () => {
      prepareUploadRes = await postRedirectHeaders(
        `${BASE_URL}/api/v1/prepare_upload`,
        {
          userEmail: email,
          fileType: 'csv',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
        }
      );

      expect(prepareUploadRes.status).toBe(201);
      expect(prepareUploadRes.data).toHaveProperty('uploadUrl');
      expect(prepareUploadRes.data).toHaveProperty('uploadId');
      expect(prepareUploadRes.data).toHaveProperty('uploadDateTime');
      expect(typeof prepareUploadRes.data.uploadUrl).toBe('string');
      expect(typeof prepareUploadRes.data.uploadId).toBe('string');
      expect(typeof prepareUploadRes.data.uploadDateTime).toBe('string');
    },
    20 * 1000
  );
  it('should upload input file for a new list with yield', async () => {
    const uploadUrl = prepareUploadRes.data.uploadUrl;
    const fileRelPath = '../../../externalapi/test-tool/yield4.csv';
    const filePath = path.join(__dirname, fileRelPath);
    const fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    const fileUploadRes = await axios.put(uploadUrl, fileData, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });

    expect(fileUploadRes.status).toBe(200);
  });
  it(
    'should create new list with GHG Analysis',
    async () => {
      const uploadId = prepareUploadRes.data.uploadId;
      const listName = `e2e_automation_GHG_${new Date().toISOString().replace(/\./g, '')}`;
      uploadNewRes = await postRedirectHeaders(
        `${BASE_URL}/api/v1/list/upload_new`,
        {
          uploadId,
          listName,
          analysisIDs: 'FCD',
          commodity: 'Cocoa',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
        }
      );

      expect(uploadNewRes.status).toBe(201);
      expect(uploadNewRes.data).toBeTruthy();
      expect(uploadNewRes.data).toHaveProperty('uploadId');
      expect(uploadNewRes.data).toHaveProperty('listId');
      expect(uploadNewRes.data).toHaveProperty('status');
      expect(uploadNewRes.data).toHaveProperty('errorDetails');
      expect(uploadNewRes.data).toHaveProperty('creationDate');
      expect(typeof uploadNewRes.data.uploadId).toBe('string');
      expect(typeof uploadNewRes.data.listId).toBe('string');
      expect(typeof uploadNewRes.data.status).toBe('string');
      expect(typeof uploadNewRes.data.errorDetails).toBe('string');
      expect(typeof uploadNewRes.data.creationDate).toBe('string');
    },
    40 * 1000
  );
  it(
    'Should create an GHG Analysis for the list',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${uploadNewRes.data.listId}/analysis/GHG/analyze`,
          {
            userEmail: email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );
        expect(res.status).toBe(201);
        expect(res.data).toBeTruthy();
      } catch (error) {
        console.error('GHG error', error.stack || error, error.response.data);
        throw error;
      }
      deleteList(uploadNewRes.data.listId);
    },
    40 * 1000
  );
  describe('Upload a new MapSpam commodity List missing yields', () => {
    it(
      'should prepare an upload for list missing yield',
      async () => {
        prepareUploadRes = await postRedirectHeaders(
          `${BASE_URL}/api/v1/prepare_upload`,
          {
            userEmail: email,
            fileType: 'csv',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );

        expect(prepareUploadRes.status).toBe(201);
        expect(prepareUploadRes.data).toHaveProperty('uploadUrl');
        expect(prepareUploadRes.data).toHaveProperty('uploadId');
        expect(prepareUploadRes.data).toHaveProperty('uploadDateTime');
        expect(typeof prepareUploadRes.data.uploadUrl).toBe('string');
        expect(typeof prepareUploadRes.data.uploadId).toBe('string');
        expect(typeof prepareUploadRes.data.uploadDateTime).toBe('string');
      },
      20 * 1000
    );
    it(
      'Should upload input file for a new list missing yield for some locations',
      async () => {
        const uploadUrl = prepareUploadRes.data.uploadUrl;
        const fileRelPath = '../../../externalapi/test-tool/missing_yield.csv';
        const filePath = path.join(__dirname, fileRelPath);
        const fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
        const fileUploadRes = await axios.put(uploadUrl, fileData, {
          headers: {
            'Content-Type': 'text/csv',
          },
        });

        expect(fileUploadRes.status).toBe(200);
      },
      40 * 1000
    );
    it(
      'should create new list missing yields',
      async () => {
        const uploadId = prepareUploadRes.data.uploadId;
        const listName = `e2e_automation_GHG_2_${new Date().toISOString().replace(/\./g, '')}`;
        uploadNewRes = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/upload_new`,
          {
            uploadId,
            listName,
            templateId: 13,
            analysisIDs: 'GHG',
            commodity: 'Cocoa Generic',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );

        expect(uploadNewRes.status).toBe(201);
        expect(uploadNewRes.data).toBeTruthy();
        expect(uploadNewRes.data).toHaveProperty('uploadId');
        expect(uploadNewRes.data).toHaveProperty('listId');
        expect(uploadNewRes.data).toHaveProperty('status');
        expect(uploadNewRes.data).toHaveProperty('errorDetails');
        expect(uploadNewRes.data).toHaveProperty('creationDate');
        expect(typeof uploadNewRes.data.uploadId).toBe('string');
        expect(typeof uploadNewRes.data.listId).toBe('string');
        expect(typeof uploadNewRes.data.status).toBe('string');
        expect(typeof uploadNewRes.data.errorDetails).toBe('string');
        expect(typeof uploadNewRes.data.creationDate).toBe('string');
      },
      50 * 1000
    );
    it(
      'Should not create an GHG Analysis for the list missing yields',
      async () => {
        try {
          await postRedirectHeaders(
            `${BASE_URL}/api/v1/list/${uploadNewRes.data.listId}/analysis/GHG/analyze`,
            {
              userEmail: email,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_TOKEN,
              },
            }
          );
        } catch (err) {
          expect(err.status).toBe(400);
          expect(err.message).toBe('Request failed with status code 400');
          deleteList(uploadNewRes.data.listId);
        }
      },
      40 * 1000
    );
  });
  describe('Upload a new list with non-MapSPAM commodity', () => {
    it(
      'should create new list with non-MapSpam commodity for GHG Analysis',
      async () => {
        const uploadId = prepareUploadRes.data.uploadId;
        const listName = `e2e_automation_GHG_${new Date().toISOString().replace(/\./g, '')}`;
        uploadNewRes = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/upload_new`,
          {
            uploadId,
            listName,
            analysisIDs: 'FCD',
            commodity: 'Non-MapSPAM Commodity',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );

        expect(uploadNewRes.status).toBe(201);
        expect(uploadNewRes.data).toBeTruthy();
        expect(uploadNewRes.data).toHaveProperty('uploadId');
        expect(uploadNewRes.data).toHaveProperty('listId');
        expect(uploadNewRes.data).toHaveProperty('status');
        expect(uploadNewRes.data).toHaveProperty('errorDetails');
        expect(uploadNewRes.data).toHaveProperty('creationDate');
        expect(typeof uploadNewRes.data.uploadId).toBe('string');
        expect(typeof uploadNewRes.data.listId).toBe('string');
        expect(typeof uploadNewRes.data.status).toBe('string');
        expect(typeof uploadNewRes.data.errorDetails).toBe('string');
        expect(typeof uploadNewRes.data.creationDate).toBe('string');
      },
      40 * 1000
    );
    it(
      'Should not create an GHG Analysis for non MapsPam list missing yields',
      async () => {
        try {
          await postRedirectHeaders(
            `${BASE_URL}/api/v1/list/${uploadNewRes.data.listId}/analysis/GHG/analyze`,
            {
              userEmail: email,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_TOKEN,
              },
            }
          );
        } catch (err) {
          expect(err.status).toBe(400);
          expect(err.message).toBe('Request failed with status code 400');
          deleteList(uploadNewRes.data.listId);
        }
      },
      40 * 1000
    );
  });
});
