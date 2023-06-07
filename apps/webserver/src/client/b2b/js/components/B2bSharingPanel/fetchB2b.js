import httpRequest from '../../../../common/js/utils/httpRequest';

async function getOrgsList(email) {
  httpRequest
    .fetchJSON(`/connection/${email}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function getConnections() {
  httpRequest
    .fetchJSON('/connection', {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function sendInvitation(email, organizationName) {
  httpRequest
    .fetchForm('/invitation', { email, organizationName })
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function resendInvitation(id) {
  httpRequest
    .fetchForm(`/invitation/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function acceptConnection(id) {
  httpRequest
    .fetchForm(`/connection/accept/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function rejectConnection(id) {
  httpRequest
    .fetchForm(`/connection/reject/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function cancelConnection(id) {
  httpRequest
    .fetchForm(`/connection/cancel/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
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
