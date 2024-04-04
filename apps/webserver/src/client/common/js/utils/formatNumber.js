export function formatNumber(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + 'M';
  }

  return number?.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
