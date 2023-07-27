import httpRequest from './../../../common/js/utils/httpRequest';
import {
  getConnections,
  sendInvitation,
  acceptConnection,
  cancelConnection,
  rejectConnection,
  resendInvitation,
  getOrgsList,
} from './../../js/components/B2bSharingPanel/fetchB2b';

const email = 'test@example.com';
const mockedResponse = [];
const id = 10;
const updateBody = {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
};

global.fetch = jest.fn(() => Promise.resolve([]));

jest.mock('./../../../common/js/utils/httpRequest', () => ({
  fetchJSON: jest.fn(() => Promise.resolve(mockedResponse)),
  fetchForm: jest.fn(() => Promise.resolve(mockedResponse)),
  fetchGet: jest.fn(() => Promise.resolve(mockedResponse)),
}));

const runfetchTests = ({ action, param, path, httpMethod, body }) => {
  it('should call fetchJSON with the correct URL', async () => {
    await action(param);
    if (body) {
      expect(httpMethod).toHaveBeenCalledWith(path, body);
    } else {
      expect(httpMethod).toHaveBeenCalledWith(path);
    }
  });

  it('should return parsed JSON response', async () => {
    httpMethod.mockResolvedValueOnce(mockedResponse);
    const result = await action(param);
    expect(mockedResponse).toEqual(result);
  });

  it('should log an error on failure', async () => {
    const result = await action(param);
    expect(result).toEqual([]);
  });
};

describe('fetchB2b', () => {
  describe('getOrgsList', () => {
    runfetchTests({
      action: getOrgsList,
      param: email,
      path: `/b2b/connection/${email}`,
      httpMethod: httpRequest.fetchJSON,
      body: {},
    });
  });

  describe('getConnections', () => {
    runfetchTests({
      action: getConnections,
      param: undefined,
      path: '/b2b/connection',
      httpMethod: httpRequest.fetchGet,
      body: undefined,
    });
  });

  describe('sendInvitation', () => {
    runfetchTests({
      action: sendInvitation,
      param: email,
      path: '/b2b/invitation',
      httpMethod: fetch,
      body: { body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" }, method: "POST" },
    });
  });

  describe('acceptConnection', () => {
    runfetchTests({
      action: acceptConnection,
      param: id,
      path: `/b2b/connection/accept/${id}`,
      httpMethod: fetch,
      body: updateBody
    });
  });

  describe('rejectConnection', () => {
    runfetchTests({
      action: rejectConnection,
      param: id,
      path: `/b2b/connection/reject/${id}`,
      httpMethod: fetch,
      body: updateBody
    });
  });

  describe('cancelConnection', () => {
    runfetchTests({
      action: cancelConnection,
      param: id,
      path: `/b2b/connection/cancel/${id}`,
      httpMethod: fetch,
      body: updateBody
    });
  });
});
