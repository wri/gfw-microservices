const redirectToMap = (data) => {
  const searchParams = new URLSearchParams();
  // Manually expand array values (e.g., selectedLocations) as repeated query params
  // so they can be correctly parsed as arrays in getQueryParams()
  for (const key in data) {
    if (Array.isArray(data[key])) {
      data[key].forEach((val) => {
        searchParams.append(key, val);
      });
    } else {
      searchParams.set(key, data[key]);
    }
  }

  const urlWithQuery = `map?${searchParams.toString()}`;
  window.location.href = urlWithQuery;
  return;
};

export default redirectToMap;
