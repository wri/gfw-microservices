export const listStatus = {
  pending: 1,
  active: 2,
  inactive: 3,
  draft: 4,
  analyzingDiagnostic: 5,
  analyzingDashboard: 6,
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

const isStringValid = (string) => {
  return string === null || string === 'None';
}

export const sortByNone = (a, b) => {
  if (isStringValid(a) && a !== b) {
    return 1;
  }
  if (isStringValid(b) && a !== b) {
    return -1;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const locatiopnIsActive = (location) => {
  return location.location_status_id === listStatus['active'];
}

const isOnlyLastLocationsIsActive = (a, b) => {
  return !locatiopnIsActive(a) && locatiopnIsActive(b);
}

const isOnlyFirstLocationsIsActive = (a, b) => {
  return locatiopnIsActive(a) && !locatiopnIsActive(b);
}

const isBothLocationsAreActive = (a, b) => {
  return locatiopnIsActive(a) && locatiopnIsActive(b);
}

const isNeitherLocationsAreActive = (a, b) => {
  return !locatiopnIsActive(a) && !locatiopnIsActive(b);;
}

export const sortByStatus = (a, b) => {
  if (isOnlyLastLocationsIsActive(a, b)) {
    return -1;
  } else if (isNeitherLocationsAreActive(a, b)) {
    return 0;
  } else if (isOnlyFirstLocationsIsActive(a, b)) {
    return 1;
  } else if (isBothLocationsAreActive(a, b)) {
    return 'active';
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
  return formatDigit(Object.values(JSON.parse(data)).reduce((a, b) => a + b, 0));
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
  return Object.values(JSON.parse(data)).reduce((aa, bb) => aa + bb, 0)
} 

export const sortObjectNumbers = (a, b) => {
  const x = a === '{}' || !a ? 0 : parseFloat(getValue(a).replace(',', ''));
  const y = b === '{}' || !b ? 0 : parseFloat(getValue(b).replace(',', ''));

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
