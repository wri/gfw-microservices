const controller = require('../controllers/account.controller');
const path = require('path');
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
/**
 * @name exports
 * @static
 * @summary Account page routes
 */
module.exports = (app) => {
  /**
   * @name /account
   * @see account.controller
   * @memberof Router
   */
  app.get('/account', controller.account);

  app.post('/auth/signinpost', (req, res) => {
    console.log('POST /auth/signinpost');
    const { username, password } = req.body;
    AuthManager.login(req, username, password)
      .then((result) => {
        if (result.authenticationStatus === 1) {
          res.send('Authenticated');
        } else if (result.authenticationStatus === 2) {
          res.send('Unauthenticated');
        } else if (result.authenticationStatus === 3) {
          res.send('RequireNewPassword');
        } else if (result.authenticationStatus === 4) {
          res.send('ConfirmPassword');
        } else if (result.authenticationStatus === 5) {
          res.send('Disabled');
        } else if (result.authenticationStatus === 6) {
          res.send('ResetRequired');
        } else if (result.authenticationStatus === 7) {
          res.send('ForceReset');
        } else if (result.authenticationStatus === 8) {
          res.send('ResendPassword');
        } else {
          res.send('Login error');
        }
      })
      .catch((err) => {
        res.send(err.userMessage || err.message);
        console.log('Reject', err);
      });
  });

  app.post('/createnewaccount', (req, res) => {
    console.log('POST /createnewaccount');
    let {
      parent_org_name,
      is_subsidiary,
      arr_user_geography_ids,
      arr_user_commodity_ids,
      user_middle_initial,
    } = req.body;

    const {
      org_name,
      org_address,
      org_website,
      arr_org_classification_ids,
      user_first_name,
      user_last_name,
      user_email,
      user_phone,
      user_title_id,
      policyList,
      policyName,
      otherTitle, // TODO: Use this text in place of our user_title_id...if it exists and we have the DB support for it
    } = req.body;

    // Convert user email to lowercase
    const userEmail = user_email.toLowerCase();

    if (!is_subsidiary) {
      is_subsidiary = 0;
    }
    if (!parent_org_name) {
      parent_org_name = '';
    }

    if (!arr_user_geography_ids) {
      arr_user_geography_ids = [];
    }

    if (!arr_user_commodity_ids) {
      arr_user_commodity_ids = [];
    }

    if (!user_middle_initial) {
      user_middle_initial = '';
    }

    if (
      !org_name ||
      !org_address ||
      !org_website ||
      !arr_org_classification_ids ||
      !user_first_name ||
      !user_last_name ||
      !userEmail ||
      !user_phone ||
      !user_title_id
    ) {
      res.send('Account signup failed');
    } else {
      AccountManager.requestNewAccount(
        req,
        org_name,
        org_address,
        org_website,
        parent_org_name,
        is_subsidiary,
        arr_org_classification_ids,
        user_first_name,
        user_middle_initial,
        user_last_name,
        userEmail,
        user_phone,
        user_title_id,
        otherTitle,
        arr_user_geography_ids,
        arr_user_commodity_ids,
        policyList,
        policyName
      )
        .then((result) => {
          console.log('Account Request Success', result);
          res.send('AccountRequested');
        })
        .catch((err) => {
          res.send('Account signup failed');
          console.log('Reject', err);
        });
    }
  });
};
