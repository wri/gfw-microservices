/**
 * @param {fetchObject} Object
 * @property {url}      String - route to be fetched
 * @property {method}   String - method to call route (GET, POST, PUT, etc..)
 * @property {headers}  Object - request headers
 * @property {body}     Object - optional, typically used in POST requests
 * @property {async}    Boolean - run the requests asynchronously or not
 */
module.exports = (fetchObject) => {
  let { url, method, headers, body, async } = fetchObject;
  if (typeof url === 'undefined') {
    url = '';
  }
  if (typeof method === 'undefined') {
    method = 'GET';
  }
  if (typeof headers === 'undefined') {
    headers = {};
  }
  if (typeof body === 'undefined') {
    body = {};
  }
  if (typeof async === 'undefined') {
    async = true;
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    // handle the response
    request.onload = () => {
      const { responseText, status } = request;
      if (responseText === '' || status >= 400) {
        reject(new Error('failed request'));
        return;
      }
      const json = JSON.parse(responseText);
      const { redirect } = json;
      if (redirect) {
        window.location = redirect;
      }
      resolve(json);
    };
    // catch request errors
    request.onerror = (error) => reject(error);
    // catch request timeouts
    request.ontimeout = (error) => reject(error);
    // initialize the request
    request.open(method, url, async);
    // set the headers
    Object.entries(headers).forEach((head) => {
      const [header, value] = head;
      request.setRequestHeader(header, value);
    });
    // send the request
    if (method === 'GET') {
      request.send();
    } else {
      request.send(JSON.stringify(body));
    }
  });
};
