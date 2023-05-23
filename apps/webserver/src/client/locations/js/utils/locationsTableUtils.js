export const listStatus = {
  pending: 1,
  active: 2,
  inactive: 3,
  draft: 4,
  analyzingDiagnostic: 5,
  analyzingDashboard: 6,
}

export const getColorByLevelClasse = {
  0: 'yellow',
  1: 'orange',
  2: 'red',
}

export const sortAlphaNum = (a, b) => {
  const reA = /[^a-zA-Z]/g;
  const reN = /[^0-9]/g;
  const aA = a.replace(reA, '');
  const bA = b.replace(reA, '');
  if (aA === bA) {
    const aN = parseInt(a.replace(reN, ''), 10);
    const bN = parseInt(b.replace(reN, ''), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  }
  return aA > bA ? 1 : -1;
};

const isStringNone = (string) => {
  return string === null || string === 'None';
}

export const sortByNone = (rowA, rowB) => {
  if (isStringNone(rowA) && rowA !== rowB) {
    return 1;
  }
  if (isStringNone(rowB) && rowA !== rowB) {
    return -1;
  }
  if (rowA < rowB) {
    return -1;
  }
  if (rowA > rowB) {
    return 1;
  }
  return 0;
};

export const locationIsActive = (location) => {
  return location.location_status_id === listStatus['active'];
}

const isOnlyLastLocationsIsActive = (rowA, rowB) => {
  return !locationIsActive(rowA) && locationIsActive(rowB);
}

const isOnlyFirstLocationsIsActive = (rowA, rowB) => {
  return locationIsActive(rowA) && !locationIsActive(rowB);
}

const isBothLocationsAreActive = (rowA, rowB) => {
  return locationIsActive(rowA) && locationIsActive(rowB);
}

const isNeitherLocationsAreActive = (rowA, rowB) => {
  return !locationIsActive(rowA) && !locationIsActive(rowB);;
}

export const sortByStatus = (rowA, rowB) => {
  if (isOnlyLastLocationsIsActive(rowA, rowB)) {
    return -1;
  } else if (isNeitherLocationsAreActive(rowA, rowB)) {
    return 0;
  } else if (isOnlyFirstLocationsIsActive(rowA, rowB)) {
    return 1;
  } else if (isBothLocationsAreActive(rowA, rowB)) {
    return 2;
  }

  return 0;
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
  return Object.values(JSON.parse(data)).reduce((columnA, columnB) => columnA + columnB, 0)
} 

export const sortObjectNumbers = (rowA, rowB) => {
  const x = rowA === '{}' || !rowA ? 0 : parseFloat(getValue(rowA).replace(',', ''));
  const y = rowB === '{}' || !rowB ? 0 : parseFloat(getValue(rowB).replace(',', ''));

  return x - y;
};

export const sortByDate = (a, b) => {
  if (a === '') {
    return -1;
  }
  const x = new Date(a);
  const y = new Date(b);
  return x - y;
};
