import {
  getAllFeatureFlags,
  getFeatureFlagsByFlagId,
  upsertFeatureFlag,
  getAccountListData,
} from '../../js/components/featuresFlags/featureFlags.utils';

jest.mock('node-fetch');

const { Response } = jest.requireActual('node-fetch');

beforeEach(() => {
  jest.resetAllMocks();
});

test('getAllFeatureFlags fetches data correctly', async () => {
  const mockData = { data: [{ flagId: 'TestFlag', flagState: true }] };
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockData)));

  const result = await getAllFeatureFlags();

  expect(global.fetch).toHaveBeenCalledWith('/api/feature-flags', expect.any(Object));
  expect(result).toEqual(mockData.data);
});

test('getFeatureFlagsByFlagId fetches data correctly', async () => {
  const mockData = { data: [{ flagId: 'TestFlag', flagState: true }] };
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockData)));

  const result = await getFeatureFlagsByFlagId('TestFlag');

  expect(global.fetch).toHaveBeenCalledWith('/api/feature-flags/TestFlag', expect.any(Object));
  expect(result).toEqual(mockData.data);
});

test('upsertFeatureFlag sends correct data and returns result', async () => {
  const mockData = { data: { flagId: 'TestFlag', flagState: true } };
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockData)));

  const result = await upsertFeatureFlag({ flagId: 'TestFlag', flagState: true });

  expect(global.fetch).toHaveBeenCalledWith('/api/feature-flags', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      flagId: 'TestFlag',
      flagState: true,
      orgId: null,
    }),
  });

  expect(result).toEqual(mockData.data);
});

test('getAccountListData fetches data correctly', async () => {
  const mockData = [{ organization_id: 1, organization_name: 'Org 1' }];
  global.fetch = jest.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockData)));

  const result = await getAccountListData();

  expect(global.fetch).toHaveBeenCalledWith('/pro-manager-list/accounts', expect.any(Object));
  expect(result).toEqual(mockData);
});