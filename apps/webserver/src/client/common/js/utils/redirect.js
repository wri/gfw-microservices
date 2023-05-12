/**
 * Send user to page and pass related data
 * @param {String} url - Local page to redirect (eg. "/map")
 * @param {Object} data - Related data for redirected page
 */
const redirectToPage = (url, data) => {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = url;

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify(data);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
};

export default redirectToPage;
