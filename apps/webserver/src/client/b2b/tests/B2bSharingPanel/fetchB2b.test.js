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
const mockedResponse = { result: 'mocked response' };
const id = 10;

jest.mock('./../../../common/js/utils/httpRequest', () => ({
  fetchJSON: jest.fn(() => Promise.resolve(mockedResponse)),
  fetchForm: jest.fn(() => Promise.resolve(mockedResponse)),
}));

const runfetchTests = ({ action, param, path, httpMethod, body }) => {
  it('should call fetchJSON with the correct URL', async () => {
    await action(param);
    expect(httpMethod).toHaveBeenCalledWith(path, body);
  });

  it('should return parsed JSON response', async () => {
    httpMethod.mockResolvedValueOnce(JSON.stringify(mockedResponse));
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
      path: `/connection/${email}`,
      httpMethod: httpRequest.fetchJSON,
      body: {},
    });
  });

  describe('getConnections', () => {
    runfetchTests({
      action: getConnections,
      param: email,
      path: '/connection',
      httpMethod: httpRequest.fetchJSON,
      body: {},
    });
  });

  describe('sendInvitation', () => {
    runfetchTests({
      action: sendInvitation,
      param: email,
      path: '/invitation',
      httpMethod: httpRequest.fetchForm,
      body: { email },
    });
  });

  describe('resendInvitation', () => {
    runfetchTests({
      action: resendInvitation,
      param: id,
      path: `/invitation/${id}`,
      httpMethod: httpRequest.fetchForm,
      body: {},
    });
  });

  describe('acceptConnection', () => {
    runfetchTests({
      action: acceptConnection,
      param: id,
      path: `/connection/accept/${id}`,
      httpMethod: httpRequest.fetchForm,
      body: {},
    });
  });

  describe('rejectConnection', () => {
    runfetchTests({
      action: rejectConnection,
      param: id,
      path: `/connection/reject/${id}`,
      httpMethod: httpRequest.fetchForm,
      body: {},
    });
  });

  describe('cancelConnection', () => {
    runfetchTests({
      action: cancelConnection,
      param: id,
      path: `/connection/cancel/${id}`,
      httpMethod: httpRequest.fetchForm,
      body: {},
    });
  });
});
