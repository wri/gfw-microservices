const getAccountUsagePercentage = () => {
  return fetch(`/analytics/myorg/usagePercentage`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
  }).then((res) => res.json());
};

export default getAccountUsagePercentage;
