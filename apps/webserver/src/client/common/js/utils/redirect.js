const redirectToMap = (data) => {
  const searchParams = new URLSearchParams(data);
  const urlWithQuery = `map?${searchParams.toString()}`;

  window.location.href = urlWithQuery;
  return;
};

export default redirectToMap;
