const getSingleLocationData = async (props) => {
  const { selectedList, spatialData, selectedLocations, isGfwList, isSharedList } = props;

  if (Array.isArray(spatialData[0])) {
    return spatialData;
  }

  return fetch(`/diagnostics/${selectedList.id}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      locationId: selectedLocations[0] || '',
      isSharedList,
      isGfwList,
    }),
  })
    .then((res) => res.json())
    .then((diagnosticsData) => {
      const { spatialData } = diagnosticsData;

      return spatialData;
    });
};

export { getSingleLocationData }