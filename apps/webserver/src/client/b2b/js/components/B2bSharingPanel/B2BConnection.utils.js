export const filterPerStatus = (data, currentStatusFilter, newStatusFilter) => {
  if (currentStatusFilter === newStatusFilter) {
    return { data, filter: '' };
  }

  const filteredData = data.filter((el) => el.status === newStatusFilter);
  return { data: filteredData, filter: newStatusFilter };
};
