const path = require('path');
const moment = require('moment');

const logger = require(path.resolve('./config/privateutils/logger.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const { listStatus } = require(path.resolve('./config/env/listStatuses.constants'));

/** @function {checkActive}
 *   @summary Used to check if the user is an active user
 *   @param {Object} request - request
 *   @param {Object} response - response
 *   @param {Object} next - action
 */
const checkActive = (request, response, next) => {
  const { method } = request;
  AuthManager.getUserOrganizationStatus(request)
    .then((status_id) => {
      if (status_id === listStatus.Active) {
        return next();
      } else {
        if (method === 'POST') {
          response.status(401).json({
            redirect: '/',
          });
        } else {
          response.redirect('/');
        }
      }
    })
    .catch((err) => {
      // NOTE: Better to use logger here in case this line is needed for debugging
      // Otherwise we can remove this line
      console.log('Error checkActive', err);
      if (method === 'POST') {
        response.status(401).json({
          redirect: '/',
        });
      } else {
        response.redirect('/');
      }
    });
};

/** @function {checkAuthentication}
 *   @summary Used to verify if the session is an not authenticated session for the main site.
 *   @param {Object} request - request
 *   @param {Object} response - response
 *   @param {Object} next - action
 */
const checkAuthentication = (request, response, next) => {
  const { organization_id } = request.session;
  if (organization_id !== undefined) {
    return next();
  } else {
    response.redirect('/');
  }
};

/** @function {checkInactivity}
 *   @summary Verify if the user has had activity within the last 30 minutes
 *   @param {Object} request - request
 *   @param {Object} response - response
 *   @param {Object} next - action
 */
const checkInactivity = (request, response, next) => {
  const { method, baseUrl } = request;
  const {
    last_activity_time,
    ispromanager,
    user_first_name,
    user_last_name,
    organization_database,
  } = request.session;
  const inactiveLimit = moment().subtract(4, 'hours');
  const lastActiveTimeMoment = moment(last_activity_time);
  const isInactiveSession = baseUrl === '/session' && !last_activity_time ? true : false;

  function redirectClient() {
    if (method === 'POST') {
      response.status(401).json({
        redirect: '/',
      });
    } else {
      response.redirect('/');
    }
  }

  if (lastActiveTimeMoment.isBefore(inactiveLimit)) {
    if (ispromanager) {
      request.session.destroy();
      redirectClient();
    } else {
      // organization_database is empty when user logs in with password but without verifying 2FA token
      if (organization_database) {
        const message = `User ${user_first_name} ${user_last_name} has logged out due to inactivity.`;
        logger
          .logActivity(request, logger.listActivityTypes.User.UserLogout, message)
          .finally(() => {
            request.session.destroy();
            redirectClient();
          })
          .catch(() => {
            logger.error('Ignoring logActivity error during logout to avoid app crash');
          });
      } else {
        request.session.destroy();
        redirectClient();
      }
    }
  } else if (isInactiveSession) {
    // If the session has expired and the user has multiple tabs open, last_activity_time is undefined
    // We can therefore log them out
    redirectClient();
  } else {
    // If we are checking for the session, do not update the last activity time
    // This is done so that the checking user activity does not affect their last activity
    if (baseUrl !== '/session') {
      request.session.last_activity_time = moment().toDate();
    }
    return next();
  }
};

const checkOrganization = (request, response, next) => {
  const { method } = request;
  AuthManager.getOrganizationStatus(request)
    .then((statusId) => {
      if (statusId === listStatus.Active) {
        return next();
      } else {
        if (method === 'POST') {
          response.status(401).json({
            redirect: '/',
          });
        } else {
          response.redirect('/');
        }
      }
    })
    .catch(() => {
      if (method === 'POST') {
        response.status(401).json({
          redirect: '/',
        });
      } else {
        response.redirect('/');
      }
    });
};

const checkProManagerAuthentication = (request, response, next) => {
  const { verified_promanager } = request.session;
  if (verified_promanager) {
    next();
  } else {
    response.redirect('/pro-manager');
  }
};

/** @function {checkRecognized}
 *   @summary Used to check if the user has gone through the first stage of login (but not verified).
 *   @param {Object} request - request
 *   @param {Object} response - response
 *   @param {Object} next - action
 */
const checkRecognized = (request, response, next) => {
  const { user_email } = request.session;
  if (user_email !== undefined) {
    return next();
  } else {
    response.redirect('/');
  }
};

const rateLimitAuthenticated = {
  windowMs: 1000, // 1 second
  max: 20, // Limit each client to `max` requests per window
};

// max can't be one and best to match same number as authenticated case above
// someone reloading the home page will be treated as same client and could get
// limited unintentionally.  Therefore, increasing windowMs and keep max same.
const rateLimitUnauthenticated = {
  windowMs: 20 * 1000, // 20 seconds
  max: 20, // Limit each client to `max` requests per window
};

module.exports = {
  checkActive,
  checkAuthentication,
  checkInactivity,
  checkOrganization,
  checkProManagerAuthentication,
  checkRecognized,

  rateLimitAuthenticated,
  rateLimitUnauthenticated,
};
