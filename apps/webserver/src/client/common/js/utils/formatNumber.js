export function formatNumber(number) {
  if (number >= 1000000) {
    return addComma((number / 1000000)) + 'M';
  }

  return addComma(number);
}

function addComma() {
  return number
  ?.toFixed(2)
  .toString()
  .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
