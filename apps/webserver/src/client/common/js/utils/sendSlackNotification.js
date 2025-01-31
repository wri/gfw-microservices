import httpRequest from './httpRequest';

/**
 * @description - send notification to the slack log channel from the front end
 *
 * @param {string} text - Title of notification / error
 * @param {Object} stackTrace - Data to be logged
 * @return {null}
 */
const sendSlackNotification = (stackTrace) => {
  const url = window.location.href;
  const browserInfo = navigator.userAgent;

  const payload = {
    url,
    stackTrace,
    browserInfo,
  };

  httpRequest.fetchJSON('/slack-notification', payload);
};

export default sendSlackNotification;
