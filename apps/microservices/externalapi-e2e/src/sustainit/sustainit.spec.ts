import axios from 'axios';

const BASE_URL = process.env.API_BASEURL || 'http://localhost:3337';
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;

describe('API Endpoints', () => {
  describe('GET Endpoints', () => {
    it('should return the list details', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/1435`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);

    it('should return the alerts analysis status', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/1435/analysis/Alerts/status`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);

    it('should return the FCD analysis status', async () => {
      const res = await axios.get(`${BASE_URL}/api/v1/list/1435/analysis/FCD/status`, {
        headers: {
          'x-api-key': API_TOKEN,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeTruthy();
    }, 10000);
  });

  describe('POST Endpoints', () => {
    it('should generate alerts analysis', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/v1/list/1435/analysis/Alerts/generate`,
        {
          userEmail: email,
          startDate: '01-01-2024',
          endDate: '02-17-2024',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
          maxRedirects: 0,
        }
      );

      expect(res.status).toBe(201);
      expect(res.data).toBeTruthy();
    }, 10000);

    it('should prepare an upload', async () => {
      const res = await axios.post(
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
          maxRedirects: 0,
        }
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('uploadUrl');
      expect(res.data).toHaveProperty('uploadId');
    }, 10000);

    it('should upload a new list', async () => {
      const prepareRes = await axios.post(
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
          maxRedirects: 0,
        }
      );

      const uploadUrl = prepareRes.data.uploadUrl;
      const uploadId = prepareRes.data.uploadId;

      const fileUploadRes = await axios.put(uploadUrl, null, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });

      expect(fileUploadRes.status).toBe(200);

      const uploadNewRes = await axios.post(
        `${BASE_URL}/api/v1/list/upload_new`,
        {
          uploadId,
          uploadUrl,
          listName: 'testupload',
          templateId: '1',
          analysisIDs: '1234',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_TOKEN,
          },
          maxRedirects: 0,
        }
      );

      expect(uploadNewRes.status).toBe(201);
      expect(uploadNewRes.data).toBeTruthy();
    }, 10000);

    it('should delete the uploaded item', async () => {
      const prepareRes = await axios.post(
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
          maxRedirects: 0,
        }
      );

      const uploadId = prepareRes.data.uploadId;

      it('should delete the list', async () => {
        const res = await axios.post(
          `${BASE_URL}/api/v1/list/${uploadId}/delete/list`,
          {
            userEmail: email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
            maxRedirects: 0,
          }
        );

        expect(res.status).toBe(200);
        expect(res.data).toBeTruthy();
      }, 10000);
    }, 10000);
  });
});
