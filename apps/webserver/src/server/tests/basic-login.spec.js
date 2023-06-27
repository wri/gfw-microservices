/**
 * @jest-environment node
 */
// The above overrides 'testEnvironment' setting in jest.config.json to allow nodeJS server environment

const supertest = require('supertest');
let app;
const setupTestDb = require('./setupTestDb');

describe('Basic smoke with REST APIs', () => {
  let cookies;
  const username = 'dt_user0@jestco.co';
  // setupDB and wait for app to be ready
  beforeAll(async () => {
    // first setup DB, then start app because app depends on initial DB contents
    await setupTestDb.initDb();
    app = require('../../server');
    return new Promise((resolve) => {
      app.on('appReady', () => {
        resolve();
      });
    });
  }, 40 * 1000); // increase timeout to 40 second

  it('login', async () => {
    const request = supertest(app);
    const resLogin = await request
      .post('/auth/signinpost')
      .send({ username, password: 'unsafe' })
      .expect(200);
    cookies = resLogin.headers['set-cookie'];

    expect(resLogin.text).toBe('Authenticated');
    expect(cookies).not.toBeUndefined();

    const resVerify = await request
      .post('/auth/verifyLogin')
      .set('Cookie', cookies)
      .send({ tokenID: 'unsafe' })
      .expect(200);

    expect(resVerify.text).toBe('User');
  });

  it('activity log should show login', async () => {
    const request = supertest(app);
    const resActLog = await request.post('/activityLog').set('Cookie', cookies).send().expect(200);
    const actLogJson = JSON.parse(resActLog.text);
    expect(actLogJson).not.toBeUndefined();
    expect(actLogJson.activityLog).not.toBeUndefined();
    expect(actLogJson.activityLog[0]).not.toBeUndefined();
    expect(actLogJson.activityLog[0].email).toBe(username);
  });
});
