import httpRequest from '../../../../common/js/utils/httpRequest';

async function getOrgsList(email) {
  return httpRequest
    .fetchJSON(`/connection/${email}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function getConnections() {
  return httpRequest
    .fetchJSON('/connection', {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function sendInvitation(email, organizationName) {
  return httpRequest
    .fetchForm('/invitation', { email, organizationName })
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function resendInvitation(id) {
  return httpRequest
    .fetchForm(`/invitation/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function acceptConnection(id) {
  return httpRequest
    .fetchForm(`/connection/accept/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function rejectConnection(id) {
  return httpRequest
    .fetchForm(`/connection/reject/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

async function cancelConnection(id) {
  return httpRequest
    .fetchForm(`/connection/cancel/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      return err;
    });
}

export {
  getConnections,
  sendInvitation,
  acceptConnection,
  cancelConnection,
  rejectConnection,
  resendInvitation,
  getOrgsList,
};
