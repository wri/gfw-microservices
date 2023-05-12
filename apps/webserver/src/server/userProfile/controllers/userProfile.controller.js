const path = require('path');

const { compiledAssets } = require(path.resolve('./config/config'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

/**
 * @function userProfile
 * @summary
 * @name exports.userProfile
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.userProfile = (req, res) => {
  const userID = req.query.user_id ?? null;
  res.render('userProfile', {
    userID,
    common: compiledAssets.js.common,
    userProfilejs: compiledAssets.js.userProfile,
    userProfilecss: compiledAssets.css.userProfile,
  });
};

exports.userProfileData = (req, res) => {
  const user_id = Number(req.params.user_id);
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  const isAdministrator = UserManager.isAdministrator(req);

  if (isAdministrator) {
    const promises = [AccountManager.getUsersList(req), AuthManager.getUserInfo(req)];

    Promise.all(promises)
      .then((results) => {
        const [usersList, userInfo] = results;
        const userToEdit = usersList.find((user) => user.user_id === user_id);

        res.status(200).json({
          users: usersList,
          userInfo, // TODO: use getAccountProfile..or should this be called accountInfo ?
          userToEdit,
          classifications: classes,
          commodities: commoditiesData,
          geographies: geographiesData,
          titles: titlesData,
          common: compiledAssets.js.common,
          userProfilejs: compiledAssets.js.userProfile,
          userProfilecss: compiledAssets.css.userProfile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  } else {
    AuthManager.getUserInfo(req)
      .then((userInfo) => {
        res.status(200).json({
          users: [],
          userInfo,
          userToEdit: userInfo,
          classifications: classes,
          commodities: commoditiesData,
          geographies: geographiesData,
          titles: titlesData,
          common: compiledAssets.js.common,
          userProfilejs: compiledAssets.js.userProfile,
          userProfilecss: compiledAssets.css.userProfile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  }
};

exports.createNewUserProfile = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  const isAdministrator = UserManager.isAdministrator(req);

  if (isAdministrator) {
    const promises = [AuthManager.getUserInfo(req)];

    Promise.all(promises)
      .then((results) => {
        const [usersList, userInfo] = results;

        res.status(200).json({
          users: usersList,
          userInfo, // TODO: use getAccountProfile..or should this be called accountInfo ?
          userToEdit: {},
          classifications: classes,
          commodities: commoditiesData,
          geographies: geographiesData,
          titles: titlesData,
          common: compiledAssets.js.common,
          userProfilejs: compiledAssets.js.userProfile,
          userProfilecss: compiledAssets.css.userProfile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  } else {
    AuthManager.getUserInfo(req)
      .then((userInfo) => {
        res.status(200).json({
          users: [],
          userInfo,
          userToEdit: {},
          classifications: classes,
          commodities: commoditiesData,
          geographies: geographiesData,
          titles: titlesData,
          common: compiledAssets.js.common,
          userProfilejs: compiledAssets.js.userProfile,
          userProfilecss: compiledAssets.css.userProfile,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  }
};
