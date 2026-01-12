import axios from 'axios';
import { postRedirectHeaders } from '../support/utils';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;

describe('Alerts Analysis', () => {
  it(
    'should generate alerts download',
    async () => {
      try {
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
      } catch (error) {
        console.error('Alerts/generate error', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );
  it('should return the alerts analysis download list', async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/list/${list}/analysis/Alerts/status`, {
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
      } else if (res.data.status === 'Completed') {
        expect(res.data).toHaveProperty('errorsDetails');
        expect(res.data).toHaveProperty('resultUrl');
        expect(res.data).toHaveProperty('creationDate');
        expect(res.data).toHaveProperty('expirationDate');
        expect(typeof res.data.errorDetails).toBe('undefined');
        expect(typeof res.data.resultUrl).toBe('string');
        expect(typeof res.data.creationDate).toBe('string');
        expect(typeof res.data.expirationDate).toBe('string');
      }
    } catch (error) {
      console.error('Alerts/status error', error.stack || error, error?.response?.data);
      throw error;
    }
  }, 30000);
});
