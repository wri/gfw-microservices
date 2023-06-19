import httpRequest from '../../../../common/js/utils/httpRequest';

async function getOrgsList(email) {
  httpRequest
    .fetchJSON(`/connection/${email}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
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
      return [];
    });
}

async function sendInvitation(email) {
  httpRequest
    .fetchForm('/invitation', { email })
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
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
      return [];
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
      return [];
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
      return [];
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
      return [];
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
