import httpRequest from '../../../../common/js/utils/httpRequest';
const API_BASE_URL = '/api/b2b';

async function getOrgsList(email) {
  return httpRequest
    .fetchJSON(`${API_BASE_URL}/connection/${email}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

async function getConnections() {
  return httpRequest
    .fetchGet(`${API_BASE_URL}/connection`)
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

async function sendInvitation(email, organization) {
  return fetch(`${API_BASE_URL}/invitation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, organization }),
  });
}

async function checkUserBelongsToOrgAndIsAdmin(email, organizationName) {
  return fetch(`${API_BASE_URL}/connection/check-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, organizationName }),
  });
}

async function resendInvitation(id) {
  return httpRequest
    .fetchForm(`${API_BASE_URL}/invitation/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

async function acceptConnection(id) {
  return fetch(`${API_BASE_URL}/connection/accept/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function rejectConnection(id) {
  return fetch(`${API_BASE_URL}/connection/reject/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function cancelConnection(id) {
  return fetch(`${API_BASE_URL}/connection/cancel/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
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
  checkUserBelongsToOrgAndIsAdmin,
};
