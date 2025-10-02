import axios from 'axios';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;

describe('Alerts Analysis', () => {
  let publicKey = '';

  it(
    'should retrieve the public key',
    async () => {
      try {
        const res = await axios.get(`${BASE_URL}/publicKey/1`, {
          headers: {
            'x-api-key': API_TOKEN,
          },
        });
        publicKey = res.data.publicKeyBase58;
        expect(res.status).toBe(200);
        expect(publicKey).toBeDefined();
      } catch (error) {
        console.error('Issue retrieving public key', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );
});
