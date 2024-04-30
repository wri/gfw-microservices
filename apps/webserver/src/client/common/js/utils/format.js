import moment from 'moment';

export function formatNumber(number) {
  if (number >= 1000000) {
    return addComma(number / 1000000) + 'M';
  }

  return addComma(number);
}

function addComma(number) {
  return number
    ?.toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const formatDateForCurrentBrowserLanguage = (date, format = 'L') => {
  moment.locale(navigator.language || navigator.userLanguage);
  return moment(date).format(format);
};
