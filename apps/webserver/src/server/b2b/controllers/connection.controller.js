const path = require('path');

const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const mapper = require('../mappers/invitation-mapper');
const querystring = require('node:querystring');

exports.getUserOrganizations = async (req, res, next) => {
  const { email } = req.params;

  next({
    method: 'GET',
    url: `/connection/user/${email}`,
  });
};

exports.getConnections = async (req, res, next) => {
  const [org] = await AuthManager.getOrganizations(req);
  const { organization_id: organizationId } = org;

  next({
    method: 'GET',
    url: `/connections/organization/${organizationId}`,
    mapper: mapper.invitationMapper,
  });
};

exports.acceptConnection = async (req, res, next) => {
  const userEmail = UserManager.getUserEmail(req);

  const { id } = req.params;

  next({
    method: 'POST',
    url: `/connections/${id}/accept`,
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
    url: `/connections/${id}/reject`,
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
    url: `/connections/${id}/cancel`,
    data: {
      editEmail: userEmail,
    },
  });
};

exports.checkUserBelongsToOrgAndIsAdmin = async (req, res, next) => {
  const { email, organizationName } = req.body;

  next({
    method: 'POST',
    url: `/connections/check`,
    data: {
      email: email,
      organizationName: organizationName,
    },
  });
};
