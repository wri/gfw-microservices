import httpRequest from '../../../../common/js/utils/httpRequest';
import { b2bConnectionsMock } from './b2bConnectionsMock';

async function getOrgsList(email) {
  return httpRequest
    .fetchJSON(`/b2b/connection/${email}`, {})
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
    .fetchGet('/b2b/connection')
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

async function sendInvitation(email, organization) {
  return fetch('/b2b/invitation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, organization }),
  });
}

async function checkUserBelongsToOrgAndIsAdmin(email, organizationName) {
  return fetch('/b2b/connection/check-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, organizationName }),
  });
}

async function resendInvitation(id) {
  return httpRequest
    .fetchForm(`/b2b/invitation/${id}`, {})
    .then((response) => {
      return JSON.parse(response);
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

async function acceptConnection(id) {
  return fetch(`/b2b/connection/accept/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function rejectConnection(id) {
  return fetch(`/b2b/connection/reject/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function cancelConnection(id) {
  return fetch(`/b2b/connection/cancel/${id}`, {
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
