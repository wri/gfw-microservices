const createQueryString = (params) => {
  const searchParams = new URLSearchParams();

  for (const key in params) {
    if (params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => searchParams.append(key, value));
      } else {
        searchParams.append(key, params[key]);
      }
    }
  }
  return searchParams.toString();
};

const redirectToMap = (data) => {
  const queryString = createQueryString(data);
  const urlWithQuery = `map?${queryString}`;
  window.location.href = urlWithQuery;
};

export default redirectToMap;
