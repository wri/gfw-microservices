import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { postRedirectHeaders, sanitizeError } from '../support/utils';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;
describe('API Endpoints', () => {
  describe('GET Endpoints', () => {
    it('should return specific page of lists', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list?pageSize=10&pageNum=1`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
      expect(Array.isArray(res.data)).toBe(true);
      res.data.forEach((item) => {
        expect(item).not.toBeNull();
        expect(item).toHaveProperty('listId');
        expect(item).toHaveProperty('listName');
        expect(item).toHaveProperty('locationCount');
        expect(typeof item).toBe('object');
        expect(typeof item.listId).toBe('number');
        expect(typeof item.listName).toBe('string');
        expect(item.locationCount === null || typeof item.locationCount === 'number').toBe(true);
      });
    }, 10000);

    it('should return the list details', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
      expect(res.data).toHaveProperty('listId');
      expect(typeof res.data.listId).toBe('number');
      expect(res.data.listId).toBe(parseInt(list));
      expect(res.data).toHaveProperty('listName');
      expect(typeof res.data.listName).toBe('string');
      expect(res.data).toHaveProperty('locationCount');
      expect(typeof res.data.locationCount).toBe('number');
    }, 10000);

    it('should return the FCD analysis status', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}/analysis/FCD/status`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
      expect(res.data).toHaveProperty('listId');
      expect(typeof res.data.listId).toBe('string');
      expect(res.data.listId).toBe(list);
      expect(typeof res.data.status).toBe('string');
      if (res.data.status === 'Expired') {
        expect(res.data).toHaveProperty('errorsDetails');
        expect(res.data).toHaveProperty('resultUrl');
        expect(res.data).toHaveProperty('creationDate');
        expect(res.data).toHaveProperty('expirationDate');
        expect(typeof res.data.errorDetails).toBe('undefined');
        expect(typeof res.data.resultUrl).toBe('object');
        expect(typeof res.data.creationDate).toBe('object');
        expect(typeof res.data.expirationDate).toBe('object');
      }
    }, 10000);
  });

  describe('POST Endpoints', () => {
    // disabled because re-analyze list takes a while and perturbs state for other tests
    xit(
      'should generate new analysis to existing list',
      async () => {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/Alerts/analyze`,
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
      },
      30 * 1000
    );

    let prepareUploadRes;
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

    let uploadNewRes;
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
            commodity: 'Cocoa',
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
      'should create a geojson file for download',
      async () => {
        try {
          const res = await postRedirectHeaders(
            `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/generate`,
            {
              userEmail: email,
              outputType: 'verifiableCredential',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_TOKEN,
              },
            }
          );

          expect(res.status).toBe(201);
          expect(res.data).toBe('');
        } catch (error) {
          console.error('endpoints error', error.stack || error, error?.response?.data);
          throw sanitizeError(error);
        }
      },
      30 * 1000
    );
    it(
      'should delete the list',
      async () => {
        const listId = uploadNewRes.data.listId;
        const res = await postRedirectHeaders(
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

        expect(res.status).toBe(201);
        expect(res.data).toBeTruthy();
        expect(res.data).toHaveProperty('message');
        expect(typeof res.data.message).toBe('string');
        expect(res.data.message).toMatch('has deleted list');
      },
      30 * 1000
    );
  });
});
