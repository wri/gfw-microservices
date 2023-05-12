/**
 * @jest-environment node
 */
// The above overrides 'testEnvironment' setting in jest.config.json to allow nodeJS server environment

const supertest = require('supertest');
const app = require('../../server');
const setupTestDb = require('./setupTestDb');

describe('Basic smoke with REST APIs', () => {
  // wait for app to be ready
  beforeAll(() => {
    return new Promise((resolve /* , reject */) => {
      app.on('appReady', async () => {
        await setupTestDb.initDb();
        resolve();
      });
    });
  });

  it('login', async () => {
    const request = supertest(app);
    const resLogin = await request
      .post('/auth/signinpost')
      .send({ username: 'dt_user0@jestco.co', password: 'unsafe' })
      .expect(200);
    const cookies = resLogin.headers['set-cookie'];
    expect(resLogin.text).toBe('Authenticated');
    expect(cookies).not.toBeUndefined();

    const resVerify = await request
      .post('/auth/verifyLogin')
      .set('Cookie', cookies)
      .send({ tokenID: 'unsafe' })
      .expect(200);
    // this currently fails because sqlite support doesn't have all the tables
    // authenticationManager.utils.js:292 fails reading logger.listActivityTypes.User.UserLogin
    // and ActivityTypes* should just be code and not SQL tables, but deferring that for later
    expect(resVerify.text).toBe('{}');
  });
});
