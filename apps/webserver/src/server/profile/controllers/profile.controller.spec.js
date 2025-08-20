// Mock the dependencies
jest.mock('../../../config/config', () => ({
  compiledAssets: {
    js: { common: 'common.js', profile: 'profile.js' },
    css: { profile: 'profile.css' },
  },
}));

// Mock the require statements
jest.mock('../../../config/publicutils/accountManager.utils', () => ({
  getClassifications: jest.fn(),
  getAccountProfile: jest.fn(),
  getUsersList: jest.fn(),
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  isAdministrator: jest.fn(),
}));

jest.mock('../../../config/publicutils/authenticationManager.utils', () => ({
  getUserInfo: jest.fn(),
}));

jest.mock('../../../config/publicutils/policyManager.utils', () => ({
  getPolicyList: jest.fn(),
}));

jest.mock('@wri-monorepos/sql', () => ({
  getAccountRenewalTime: jest.fn(),
}));

// Mock path.resolve to return the correct paths
jest.mock('path', () => ({
  resolve: jest.fn((path) => path.replace('./', '../../../')),
}));

// Import the controller functions
const { profile, profileInfo } = require('./profile.controller');

describe('Profile Controller', () => {
  let mockReq;
  let mockRes;
  let mockAccountManager;
  let mockUserManager;
  let mockAuthManager;
  let mockPolicyManager;
  let mockGetAccountRenewalTime;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request and response objects
    mockReq = {
      session: {
        organization_id: 'test-org-id',
      },
    };

    mockRes = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Get references to mocked modules
    mockAccountManager = require('../../../config/publicutils/accountManager.utils');
    mockUserManager = require('../../../config/publicutils/userManager.utils');
    mockAuthManager = require('../../../config/publicutils/authenticationManager.utils');
    mockPolicyManager = require('../../../config/publicutils/policyManager.utils');
    mockGetAccountRenewalTime = require('@wri-monorepos/sql').getAccountRenewalTime;
  });

  describe('profile', () => {
    it('should render profile page with correct assets', () => {
      profile(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('profile', {
        common: 'common.js',
        profilejs: 'profile.js',
        profilecss: 'profile.css',
      });
    });
  });

  describe('profileInfo', () => {
    const mockClassifications = ['classification1', 'classification2'];
    const mockAccountProfile = { name: 'Test Org' };
    const mockUsersList = [{ id: 1, name: 'User 1' }];
    const mockPolicyList = [{ id: 1, name: 'Policy 1' }];
    const mockUserInfo = { id: 1, name: 'Current User' };
    const mockAccountRenewalTime = '2024-12-31';

    beforeEach(() => {
      mockAccountManager.getClassifications.mockReturnValue(mockClassifications);
    });

    describe('when user is administrator', () => {
      beforeEach(() => {
        mockUserManager.isAdministrator.mockReturnValue(true);
        mockAccountManager.getAccountProfile.mockResolvedValue(mockAccountProfile);
        mockAccountManager.getUsersList.mockResolvedValue(mockUsersList);
        mockPolicyManager.getPolicyList.mockResolvedValue(mockPolicyList);
        mockAuthManager.getUserInfo.mockResolvedValue(mockUserInfo);
        mockGetAccountRenewalTime.mockResolvedValue(mockAccountRenewalTime);
      });

      it('should return complete profile info for administrators', async () => {
        await profileInfo(mockReq, mockRes);

        expect(mockAccountManager.getClassifications).toHaveBeenCalledWith(mockReq);
        expect(mockUserManager.isAdministrator).toHaveBeenCalledWith(mockReq);
        expect(mockAccountManager.getAccountProfile).toHaveBeenCalledWith(mockReq);
        expect(mockAccountManager.getUsersList).toHaveBeenCalledWith(mockReq);
        expect(mockPolicyManager.getPolicyList).toHaveBeenCalledWith(mockReq);
        expect(mockAuthManager.getUserInfo).toHaveBeenCalledWith(mockReq);
        expect(mockGetAccountRenewalTime).toHaveBeenCalledWith('test-org-id');

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          organization: mockAccountProfile,
          accountRenewalTime: mockAccountRenewalTime,
          users: mockUsersList,
          userInfo: mockUserInfo,
          classifications: mockClassifications,
          policyList: mockPolicyList,
          common: 'common.js',
          profilejs: 'profile.js',
          profilecss: 'profile.css',
        });
      });

      it('should handle errors when promises reject', async () => {
        const testError = new Error('Test error');
        mockAccountManager.getAccountProfile.mockRejectedValue(testError);

        await profileInfo(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'Error getting profile info',
        });
      });
    });

    describe('when user is not administrator', () => {
      beforeEach(() => {
        mockUserManager.isAdministrator.mockReturnValue(false);
        mockAuthManager.getUserInfo.mockResolvedValue(mockUserInfo);
      });

      it('should return limited profile info for non-administrators', async () => {
        await profileInfo(mockReq, mockRes);

        expect(mockAccountManager.getClassifications).toHaveBeenCalledWith(mockReq);
        expect(mockUserManager.isAdministrator).toHaveBeenCalledWith(mockReq);
        expect(mockAuthManager.getUserInfo).toHaveBeenCalledWith(mockReq);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          organization: '',
          users: [],
          userInfo: mockUserInfo,
          classifications: mockClassifications,
          policyList: '',
          common: 'common.js',
          profilejs: 'profile.js',
          profilecss: 'profile.css',
        });
      });

      it('should handle errors when getUserInfo rejects', async () => {
        const testError = new Error('Test error');
        mockAuthManager.getUserInfo.mockRejectedValue(testError);

        await profileInfo(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'Error getting user info',
        });
      });
    });
  });
});
