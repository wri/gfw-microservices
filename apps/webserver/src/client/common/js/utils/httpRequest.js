const fetchForm = (url, send) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      if (request.responseText === '') {
        reject('Request Failed');
      } else {
        resolve(request.responseText);
      }
    };
    request.onerror = (err) => {
      console.log(`Error: ${err}`);
    };
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send(send);
  });
};

const fetchJSON = (url, send = {}) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      if (request.responseText === '') {
        reject('Request Failed');
      } else {
        resolve(request.responseText);
      }
    };
    request.onerror = (err) => {
      console.log(`Error: ${err}`);
      reject(err);
    };
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(send));
  });
};

const fetchGet = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.responseText);
    };
    xhr.onerror = (e) => {
      reject(e);
    };
    xhr.open('GET', url);
    xhr.send();
  });
};

module.exports = {
  fetchForm,
  fetchJSON,
  fetchGet,
};
