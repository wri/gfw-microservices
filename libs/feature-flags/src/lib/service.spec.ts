import { FeatureFlagsService } from './service';

// Mock DataSource and Repository for testing
const mockRepository: any = {
  find: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  insert: jest.fn(),
};

const mockDataSource: any = {
  initialize: jest.fn(),
  destroy: jest.fn(),
  getRepository: jest.fn(() => mockRepository),
};

describe('FeatureFlagsService', () => {
  let featureFlagsService;

  beforeEach(() => {
    featureFlagsService = new FeatureFlagsService(mockDataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve all feature flags for a given orgId', async () => {
    const orgId = 1;
    const expectedFeatureFlags = [
      {
        flagId: 'self',
        orgId: 1,
        flagState: true,
        modifierUserId: 1692,
      },
    ];

    mockRepository.find.mockResolvedValue(expectedFeatureFlags);

    const result = await featureFlagsService.getAllFeatureFlags(orgId);

    expect(result).toEqual(expectedFeatureFlags);
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { orgId } });
  });
  // TODO: make it work
  xit('should retrieve a feature flag collection by flagId', async () => {
    const flagId = 'self';
    const expectedFeatureFlags = [
      {
        flagId: 'self',
        orgId: 1,
        flagState: true,
        modifierUserId: 1692,
      },
    ];

    mockRepository.find.mockResolvedValue(expectedFeatureFlags);

    const result = await featureFlagsService.getFeatureFlagById(flagId);

    expect(result).toEqual(expectedFeatureFlags);
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { flagId } });
  });
  // TODO: make it work
  xit('should create a feature flag', async () => {
    const featureFlagData = {
      flagId: 'self',
      orgId: 1,
      flagState: true,
      modifierUserId: 1692,
      updatedDateTime: new Date(),
    };

    const createdFeatureFlag = { ...featureFlagData };

    mockRepository.create.mockReturnValue(createdFeatureFlag);

    const result = await featureFlagsService.createFeatureFlag(featureFlagData);

    expect(result).toEqual(createdFeatureFlag);
    expect(mockRepository.create).toHaveBeenCalledWith(featureFlagData);
    expect(mockRepository.insert).toHaveBeenCalledWith(createdFeatureFlag);
  });
});
