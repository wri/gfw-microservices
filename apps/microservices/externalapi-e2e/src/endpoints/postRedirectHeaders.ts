import axios from 'axios';

// Axios does not send headers when following 302 redirects for POST requests
// This function is used to forward headers to redirected endpoints.
export default async function postRedirectHeaders(url, body, headers) {
  try {
    return await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
    });
  } catch (error) {
    if (error.response.status === 302) {
      return postRedirectHeaders(error.response.headers.location, body, headers);
    } else {
      throw error;
    }
  }
}
