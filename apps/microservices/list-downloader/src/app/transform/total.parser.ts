const totalParser = (operation, dataRow, data) => {
  let total = 0;
  if (data[operation.name]) {
    const yearlyData = JSON.parse(data[operation.name]);

    if (yearlyData.forEach) {
      yearlyData.forEach((year) => {
        total += year.result;
      });
    } else if (typeof yearlyData === 'number') {
      total += yearlyData;
    } else {
      Object.keys(yearlyData).forEach((year) => {
        total += yearlyData[year];
      });
    }
  } else {
    total = 0;
  }
  dataRow.push(total);
};

export { totalParser };
