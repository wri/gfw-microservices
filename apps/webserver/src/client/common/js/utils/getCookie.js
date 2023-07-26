/**
 * Gets cookie by key
 * @param {string} name cookie key
 * @returns {object}
 */
export default function getCookie(name) {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [k, v] = el.split('=');
    cookie[k.trim()] = v;
  });
  return cookie[name];
}
