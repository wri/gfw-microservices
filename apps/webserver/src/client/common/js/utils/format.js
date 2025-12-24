import { format as dateFnsFormat } from 'date-fns';

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

export const formatDateForCurrentBrowserLanguage = (date, formatStr = 'P') => {
  // date-fns uses 'P' for locale-aware short date format (equivalent to moment's 'L')
  return dateFnsFormat(new Date(date), formatStr);
};
