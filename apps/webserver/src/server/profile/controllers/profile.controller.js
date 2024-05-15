const path = require('path');

import config from '../../../config/config';
const { compiledAssets } = config;
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
import { getAccountRenewalTime } from '@wri-monorepos/sql';
/**
 * @function profile
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
export const profile = (req, res) => {
  res.render('profile', {
    common: compiledAssets.js.common,
    profilejs: compiledAssets.js.profile,
    profilecss: compiledAssets.css.profile,
  });
};

export const profileInfo = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const isAdministrator = UserManager.isAdministrator(req);

  if (isAdministrator) {
    const promises = [
      AccountManager.getAccountProfile(req),
      AccountManager.getUsersList(req),
      PolicyManager.getPolicyList(req),
      AuthManager.getUserInfo(req),
      getAccountRenewalTime(req.session.organization_id),
    ];

    Promise.all(promises)
      .then((results) => {
        const [accountProfile, usersList, policyList, userInfo, accountRenewalTime] = results;
        res.status(200).json({
          organization: accountProfile,
          accountRenewalTime,
          users: usersList,
          userInfo, // TODO: use getAccountProfile..or should this be called accountInfo ?
          classifications: classes,
          policyList,
          common: compiledAssets.js.common,
          profilejs: compiledAssets.js.profile,
          profilecss: compiledAssets.css.profile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.status(500).json({ message: 'Error getting profile info' });
      });
  } else {
    AuthManager.getUserInfo(req)
      .then((userInfo) => {
        res.status(200).json({
          organization: '',
          users: [],
          userInfo,
          classifications: classes,
          policyList: '',
          common: compiledAssets.js.common,
          profilejs: compiledAssets.js.profile,
          profilecss: compiledAssets.css.profile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  }
};
