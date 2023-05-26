const path = require('path');

const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

const querystring = require('node:querystring');

exports.getUserOrganizations = async (req, res, next) => {
  const { email } = req.params;

  next({
    method: 'GET',
    url: `/connection/user/${email}`,
  });
};

exports.getConnections = async (req, res, next) => {
  const { id, status } = req.query;
  const [org] = await AuthManager.getOrganizations(req);
  const { organization_id: organizationId } = org;

  const queryObject = Object.entries({ id, status, sourceId: organizationId }).reduce(
    (accumulator, [key, value]) => {
      if (value) {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {}
  );
  const queryParams = querystring.stringify(queryObject);

  next({
    method: 'GET',
    url: `/connection?${queryParams}`,
  });
};

exports.acceptConnection = async (req, res, next) => {
  const userEmail = UserManager.getUserEmail(req);

  const { id } = req.params;

  next({
    method: 'POST',
    url: `/connection/accept/${id}`,
    data: {
      editEmail: userEmail,
    },
  });
};

exports.rejectConnection = async (req, res, next) => {
  const userEmail = UserManager.getUserEmail(req);
  const { id } = req.params;

  next({
    method: 'POST',
    url: `/connection/reject/${id}`,
    data: {
      editEmail: userEmail,
    },
  });
};

exports.cancelConnection = async (req, res, next) => {
  const userEmail = UserManager.getUserEmail(req);

  const { id } = req.params;

  next({
    method: 'POST',
    url: `/connection/cancel/${id}`,
    data: {
      editEmail: userEmail,
    },
  });
};
