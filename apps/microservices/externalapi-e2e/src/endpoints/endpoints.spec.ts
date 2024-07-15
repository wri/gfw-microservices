import axios from 'axios';
import fs from 'fs';
import path from 'path';
import postRedirectHeaders from './postRedirectHeaders';

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
    }, 10000);

    it('should return the list details', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);

    it('should return the alerts analysis status', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}/analysis/Alerts/status`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);

    it('should return the FCD analysis status', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}/analysis/FCD/status`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);
  });

  describe('POST Endpoints', () => {
    // disabled because re-analyze list takes a while
    xit(
      'should generate new analysis to existing list',
      async () => {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/FCD/analyze`,
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
      10 * 1000
    );

    it(
      'should generate alerts download',
      async () => {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/Alerts/generate`,
          {
            userEmail: email,
            startDate: '01-01-2024',
            endDate: '07-01-2024',
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
      },
      10 * 1000
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
        const listName = `e2e_automation_${new Date().toISOString()}`;
        uploadNewRes = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/upload_new`,
          {
            uploadId,
            listName,
            templateId: 13,
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
      },
      40 * 1000
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
      },
      30 * 1000
    );
  });
});
