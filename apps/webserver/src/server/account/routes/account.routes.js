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

  app.post('/auth/signinpost', async (req, res) => {
    console.log('POST /auth/signinpost');

    const AUTH_STATUS_MAP = {
      1: 'Authenticated',
      2: 'Unauthenticated',
      3: 'RequireNewPassword',
      4: 'ConfirmPassword',
      5: 'Disabled',
      6: 'ResetRequired',
      7: 'ForceReset',
      8: 'ResendPassword',
    };

    const { username, password } = req.body;

    try {
      const result = await AuthManager.login(req, username, password);
      const message = AUTH_STATUS_MAP[result.authenticationStatus] || 'Login error';
      res.status(200).send(message);
    } catch (err) {
      console.error('Login failed:', err.stack || JSON.stringify(err) || err);
      res.status(401).send(String(err.userMessage || err.message || 'Login failed'));
    }
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
      org_country,
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
      !org_country ||
      !arr_org_classification_ids ||
      !user_first_name ||
      !user_last_name ||
      !userEmail ||
      !user_title_id
    ) {
      res.send('Account signup failed');
    } else {
      AccountManager.requestNewAccount(
        req,
        org_name,
        org_address,
        org_country,
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
