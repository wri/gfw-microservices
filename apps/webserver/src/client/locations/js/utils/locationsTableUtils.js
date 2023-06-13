import { listStatus } from '../../../../config/env/listStatuses.constants';

export const getColorByLevelClasse = {
  0: 'yellow',
  1: 'orange',
  2: 'red',
};

export const sortOrderOption = {
  sameValue: 0,
  invert: -1,
  keep: 1,
};

export const sortAlphaNum = (a, b) => {
  const reA = /[^a-zA-Z]/g;
  const reN = /[^0-9]/g;
  const aA = a.replace(reA, '');
  const bA = b.replace(reA, '');
  if (aA === bA) {
    const aN = parseInt(a.replace(reN, ''), 10);
    const bN = parseInt(b.replace(reN, ''), 10);
    return aN === bN
      ? sortOrderOption.sameValue
      : aN > bN
      ? sortOrderOption.keep
      : sortOrderOption.invert;
  }
  return aA > bA ? sortOrderOption.keep : sortOrderOption.invert;
};

const isStringNone = (string) => {
  return string === null || string === 'None';
};

export const sortByNone = (rowA, rowB) => {
  if (isStringNone(rowA) && rowA !== rowB) {
    return sortOrderOption.keep;
  }
  if (isStringNone(rowB) && rowA !== rowB) {
    return sortOrderOption.invert;
  }
  if (rowA < rowB) {
    return sortOrderOption.invert;
  }
  if (rowA > rowB) {
    return sortOrderOption.keep;
  }
  return sortOrderOption.sameValue;
};

export const locationIsActive = (location) => {
  return location.location_status_id === listStatus.Active;
};

const isOnlyLastLocationsIsActive = (rowA, rowB) => {
  return !locationIsActive(rowA) && locationIsActive(rowB);
};

const isOnlyFirstLocationsIsActive = (rowA, rowB) => {
  return locationIsActive(rowA) && !locationIsActive(rowB);
};

const isBothLocationsAreActive = (rowA, rowB) => {
  return locationIsActive(rowA) && locationIsActive(rowB);
};

const isNeitherLocationsAreActive = (rowA, rowB) => {
  return !locationIsActive(rowA) && !locationIsActive(rowB);
};

export const sortByStatus = (rowA, rowB) => {
  if (isOnlyLastLocationsIsActive(rowA, rowB)) {
    return sortOrderOption.invert;
  } else if (isNeitherLocationsAreActive(rowA, rowB)) {
    return sortOrderOption.sameValue;
  } else if (isOnlyFirstLocationsIsActive(rowA, rowB)) {
    return sortOrderOption.keep;
  } else if (isBothLocationsAreActive(rowA, rowB)) {
    return 2;
  }

  return sortOrderOption.sameValue;
};

export const checkValid = (value) =>
  value !== undefined && value !== '{}' && value !== '' && value !== ' ' && value !== null;

export const numberWithCommas = (number) => {
  return number.toLocaleString();
};

export const formatDigit = (value, lat) => {
  if (isNaN(value)) {
    return value;
  }
  if (value > 10) {
    return numberWithCommas(Math.round(value));
  }
  if (lat) {
    return numberWithCommas(Math.round(value * 1000) / 1000);
  }
  return numberWithCommas(Math.round(value * 100) / 100);
};

export const getDigit = (value, lat) => {
  if (isNaN(value)) {
    return value;
  }

  if (value > 10) {
    return Math.round(value);
  }
  if (lat) {
    return Math.round(value * 1000) / 1000;
  }
  return Math.round(value * 100) / 100;
};

export const getValue = (data) => {
  return formatDigit(Object.values(JSON.parse(data)).reduce((rowA, rowB) => rowA + rowB, 0));
};

export const getValidatedValue = (data, auditData) => {
  if (auditData === 0) {
    return '--';
  }
  return formatDigit(Object.values(JSON.parse(data)).reduce((a, b) => a + b, 0));
};

export const getLastValue = (data) => {
  const values = Object.values(JSON.parse(data));
  const formattedValue = formatDigit(values.pop());
  return parseInt(formattedValue);
};

export const getLastYear = (data) => {
  const values = Object.values(JSON.parse(data));
  const lastValue = getDigit(values.pop());
  return parseInt(lastValue);
};

export const normalizeColunmData = (data) => {
  return Object.values(JSON.parse(data)).reduce((columnA, columnB) => columnA + columnB, 0);
};

export const sortObjectNumbers = (rowA, rowB) => {
  const x = rowA === '{}' || !rowA ? 0 : parseFloat(getValue(rowA).replace(',', ''));
  const y = rowB === '{}' || !rowB ? 0 : parseFloat(getValue(rowB).replace(',', ''));

  return x - y;
};

export const sortByDate = (a, b) => {
  if (a === '') {
    return sortOrderOption.invert;
  }
  const x = new Date(a);
  const y = new Date(b);
  return x - y;
};
