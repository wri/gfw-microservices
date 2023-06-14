export const filterPerStatus = (data, status, filter) => {
  if (status === filter) {
    return { data, filter: '' };
  }

  const filteredData = data.filter((el) => el.status === status);
  return { data: filteredData, filter: status };
};
