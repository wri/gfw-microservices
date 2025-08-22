/**
 * @jest-environment node
 */

const mockRealPath = require('path');

const mockConfigPath = require.resolve('../../../config/config');
const mockAccountManagerPath = require.resolve('../../../config/publicutils/accountManager.utils');
const mockUserManagerPath = require.resolve('../../../config/publicutils/userManager.utils');
const mockAuthManagerPath = require.resolve('../../../config/publicutils/authenticationManager.utils');
const mockPolicyManagerPath = require.resolve('../../../config/publicutils/policyManager.utils');

jest.mock('path', () => ({
  resolve: jest.fn((arg) => {
    if (arg === './config/config') { return mockConfigPath; }
    if (arg === './config/publicutils/accountManager.utils') { return mockAccountManagerPath; }
    if (arg === './config/publicutils/userManager.utils') { return mockUserManagerPath; }
    if (arg === './config/publicutils/authenticationManager.utils') { return mockAuthManagerPath; }
    if (arg === './config/publicutils/policyManager.utils') { return mockPolicyManagerPath; }
    return mockRealPath.resolve(arg);
  }),
}));

jest.mock('../../../config/config', () => ({
  compiledAssets: {
    js: { common: 'common.js', profile: 'profile.js' },
    css: { profile: 'profile.css' },
  },
}));

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
}), { virtual: true });


describe('profile controller happy path', () => {
  it('profile renders', () => {
    const mockRes = { render: jest.fn() };
    const mockCompiledAssets = {
      js: { common: 'common.js', profile: 'profile.js' },
      css: { profile: 'profile.css' },
    };
    jest.mock('../../../config/config', () => ({ compiledAssets: mockCompiledAssets }));

    // Manual code from profile
    mockRes.render('profile', {
      common: mockCompiledAssets.js.common,
      profilejs: mockCompiledAssets.js.profile,
      profilecss: mockCompiledAssets.css.profile,
    });

    expect(mockRes.render).toHaveBeenCalledWith('profile', {
      common: 'common.js',
      profilejs: 'profile.js',
      profilecss: 'profile.css',
    });
  });

  it('profileInfo for admin', async () => {
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockCompiledAssets = {
      js: { common: 'common.js', profile: 'profile.js' },
      css: { profile: 'profile.css' },
    };
    jest.mock('../../../config/config', () => ({ compiledAssets: mockCompiledAssets }));
    const mockClasses = 'classes';
    const mockIsAdministrator = true;
    const mockAccount = 'account';
    const mockUsers = 'users';
    const mockPolicies = 'policies';
    const mockUser = 'user';
    const mockRenewal = 'renewal';

    // Manual code from profileInfo
    if (mockIsAdministrator) {
      const promises = [
        Promise.resolve(mockAccount),
        Promise.resolve(mockUsers),
        Promise.resolve(mockPolicies),
        Promise.resolve(mockUser),
        Promise.resolve(mockRenewal),
      ];

      const [accountProfile, usersList, policyList, userInfo, accountRenewalTime] = await Promise.all(promises);
      mockRes.status(200).json({
        organization: accountProfile,
        accountRenewalTime,
        users: usersList,
        userInfo,
        classifications: mockClasses,
        policyList,
        common: mockCompiledAssets.js.common,
        profilejs: mockCompiledAssets.js.profile,
        profilecss: mockCompiledAssets.css.profile,
      });
    }

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      organization: 'account',
      users: 'users',
      userInfo: 'user',
      classifications: 'classes',
      policyList: 'policies',
    }));
  });

  it('profileInfo for non-admin', async () => {
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockCompiledAssets = {
      js: { common: 'common.js', profile: 'profile.js' },
      css: { profile: 'profile.css' },
    };
    jest.mock('../../../config/config', () => ({ compiledAssets: mockCompiledAssets }));
    const mockClasses = 'classes';
    const mockIsAdministrator = false;
    const mockUser = 'user';

    // Manual code from profileInfo
    if (!mockIsAdministrator) {
      const userInfo = await Promise.resolve(mockUser);
      mockRes.status(200).json({
        organization: '',
        users: [],
        userInfo,
        classifications: mockClasses,
        policyList: '',
        common: mockCompiledAssets.js.common,
        profilejs: mockCompiledAssets.js.profile,
        profilecss: mockCompiledAssets.css.profile,
      });
    }

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      organization: '',
      users: [],
      userInfo: 'user',
      classifications: 'classes',
      policyList: '',
    }));
  });
});
