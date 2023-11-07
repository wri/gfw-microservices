import { createFeatureFlagsService } from './service';

// Mock the necessary DataSource and Repository
const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  initialize: jest.fn(),
  destroy: jest.fn(),
  getRepository: jest.fn(() => mockRepository),
};

describe('FeatureFlagsService', () => {
  let featureFlagsService;

  beforeEach(() => {
    featureFlagsService = createFeatureFlagsService(mockDataSource as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve feature flags for the current organization or global', async () => {
    const orgId = 1;
    const globalFeatureFlags = [
      {
        flagId: 'self',
        orgId: null,
        flagState: true,
        modifierUserId: 1692,
        updateDateTime: '2023-10-27T20:47:30.159Z',
      },
    ];
    const currentOrgFeatureFlags = [
      {
        flagId: 'self',
        orgId: 1,
        flagState: true,
        modifierUserId: 1692,
        updateDateTime: '2023-10-30T19:54:29.839Z',
      },
    ];

    mockRepository.find
      .mockResolvedValueOnce(globalFeatureFlags)
      .mockResolvedValueOnce(currentOrgFeatureFlags);

    const result = await featureFlagsService.getFeatureFlagsForCurrentOrg(orgId);

    expect(result).toEqual(currentOrgFeatureFlags); // Should return organization-specific flags
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { orgId: null } });
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { orgId } });
  });

  it('should retrieve feature flags by flagId', async () => {
    const flagId = 'self';
    const expectedFeatureFlags = [
      {
        flagId: 'self',
        orgId: null,
        flagState: true,
        modifierUserId: 1692,
        updateDateTime: '2023-10-27T20:47:30.159Z',
      },
      {
        flagId: 'self',
        orgId: 1,
        flagState: true,
        modifierUserId: 1692,
        updateDateTime: '2023-10-30T19:54:29.839Z',
      },
    ];

    mockRepository.find.mockResolvedValue(expectedFeatureFlags);

    const result = await featureFlagsService.getFeatureFlagsByFlagId(flagId);

    expect(result).toEqual(expectedFeatureFlags);
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { flagId } });
  });

  it('should create a feature flag', async () => {
    const featureFlagData = {
      flagId: 'self',
      orgId: 1,
      flagState: true,
      modifierUserId: 1692,
    };
    const createdFeatureFlag = {
      flagId: 'self',
      orgId: 1,
      flagState: true,
      modifierUserId: 1692,
      updateDateTime: '2023-10-30T19:54:29.839Z',
    };

    mockRepository.create.mockReturnValue(createdFeatureFlag);

    const result = await featureFlagsService.createFeatureFlag(featureFlagData);

    expect(result).toEqual(createdFeatureFlag);
    expect(mockRepository.create).toHaveBeenCalledWith(featureFlagData);
    expect(mockRepository.save).toHaveBeenCalledWith(createdFeatureFlag);
  });
});
