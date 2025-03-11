export const fillYears = (start, end) => {
  const years = [];
  while (start <= end) {
    years.push(start);
    start++;
  }

  return years;
};
