import httpRequest from '../../../../common/js/utils/httpRequest';
import {
  getConnections,
  sendInvitation,
  acceptConnection,
  cancelConnection,
  rejectConnection,
  resendInvitation,
  getOrgsList,
} from './yourModule';

const runfetchTests = (action) => {
  it('should call fetchJSON with the correct URL', async () => {
    const email = 'test@example.com';
    await action(email);
    expect(httpRequest.fetchJSON).toHaveBeenCalledWith(`/connection/${email}`, {});
  });

  it('should return parsed JSON response', async () => {
    const mockedResponse = { result: 'mocked response' };
    httpRequest.fetchJSON.mockResolvedValueOnce(JSON.stringify(mockedResponse));

    const email = 'test@example.com';
    const result = await action(email);
    expect(result).toEqual(mockedResponse);
  });

  it('should log an error on failure', async () => {
    const expectedError = new Error('Mocked error');
    httpRequest.fetchJSON.mockRejectedValueOnce(expectedError);

    const email = 'test@example.com';
    await action(email);
    expect(console.log).toHaveBeenCalledWith(expectedError);
  });
};

jest.mock('../../../../common/js/utils/httpRequest', () => ({
  fetchJSON: jest.fn(),
  fetchForm: jest.fn(),
}));

describe('fetchB2b', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrgsList', () => {
    runfetchTests(getOrgsList);
  });

  describe('getConnections', () => {
    runfetchTests(getConnections);
  });

  describe('sendInvitation', () => {
    runfetchTests(sendInvitation);
  });

  describe('resendInvitation', () => {
    runfetchTests(resendInvitation);
  });

  describe('acceptConnection', () => {
    runfetchTests(acceptConnection);
  });

  describe('rejectConnection', () => {
    runfetchTests(rejectConnection);
  });

  describe('cancelConnection', () => {
    runfetchTests(cancelConnection);
  });
});
