import httpRequest from './httpRequest';

/**
 * @description - send notification to the slack log channel from the front end
 *
 * @param {string} text - Title of notification / error
 * @param {Object} data - Data to be logged
 * @return {null}
 */

const sendSlackNotification = (text, data) => {

  const userData =
  ` id: ${userInfo.id}
  first_name: ${userInfo.first_name}
  email: ${userInfo.email}
  organizationId: ${organizationId}`;


  httpRequest
  .fetchJSON('/slack-notification', {
    text,
    data: JSON.stringify(data, null, "\t"),
    userInfo: userData,
  })
}


export default sendSlackNotification;
