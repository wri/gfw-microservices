const path = require('path');

const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

exports.createInvitation = async (req, res, next) => {
  const { email, organization } = req.body;
  const userEmail = UserManager.getUserEmail(req);
  const request = {
    method: 'POST',
    url: '/connections',
    data: {
      sourceEmail: userEmail,
      targetEmail: email,
      targetOrganization: organization,
      sourceOrganization: req.session.organization_id,
    },
  };

  next(request);
};

exports.resendInvite = async (req, res, next) => {
  const { id } = req.params;
  const request = {
    method: 'POST',
    url: `/connections/${id}/resend`,
  };

  next(request);
};
