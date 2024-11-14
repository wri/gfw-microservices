const redirectToMap = (data) => {
  const searchParams = new URLSearchParams(data);
  const urlWithQuery = `map?${searchParams.toString()}`;

  // TODO: undo me
  // window.location.href = urlWithQuery;
  window.open(`/${urlWithQuery}`, '_blank');
  return;
};

export default redirectToMap;
