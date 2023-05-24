const path = require('path');

const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

exports.createInvitation = async (req, res, next) => {
  const { email, organization } = req.body;

  const userEmail = UserManager.getUserEmail(req);

  next({
    method: 'POST',
    url: '/invitation',
    data: {
      sourceEmail: userEmail,
      targetEmail: email,
      targetOrganization: organization,
      sourceOrganization: req.session.organization_id,
    },
  });
};

exports.resendInvite = async (req, res, next) => {
  const { id } = req.params;

  next({
    method: 'POST',
    url: `/invitation/${id}`,
  });
};
