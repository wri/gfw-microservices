const path = require('path');

const { compiledAssets } = require(path.resolve('./config/config'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
import { getAccountActivatedTime } from '@wri-monorepos/sql';
/**
 * @function profile
 * @summary
 * @name exports.profile
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.profile = (req, res) => {
  res.render('profile', {
    common: compiledAssets.js.common,
    profilejs: compiledAssets.js.profile,
    profilecss: compiledAssets.css.profile,
  });
};

exports.profileInfo = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const isAdministrator = UserManager.isAdministrator(req);

  if (isAdministrator) {
    const promises = [
      AccountManager.getAccountProfile(req),
      AccountManager.getUsersList(req),
      PolicyManager.getPolicyList(req),
      AuthManager.getUserInfo(req),
      getAccountActivatedTime(req.session.organization_id),
    ];

    Promise.all(promises)
      .then((results) => {
        const [accountProfile, usersList, policyList, userInfo, accountActivatedTime] = results;
        res.status(200).json({
          organization: accountProfile,
          accountActivatedTime,
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
