import validationsHelper from './validations.utils';

const mandatoryCheck = (str) => {
  let returnValue = true;
  if (!str) {
    returnValue = false;
  } else if (str.length === 0) {
    returnValue = false;
  }
  return returnValue;
};

const alpha = (str) => {
  const regCheck = validationsHelper.alpha;
  return regCheck.test(str) || str === '';
};

const alphanumericSpace = (str) => {
  const regCheck = validationsHelper.alphaNumericSpace;
  return regCheck.test(str) || str === '';
};

const alphanumeric = (str) => {
  const regCheck = /^[a-zA-Z0-9]*$/;
  return regCheck.test(str) || str === '';
};

const validAddress = (str) => {
  // const regCheck = /^[a-zA-Z0-9\s,\.\-]*$/;
  const regCheck = /.*\S.*/;
  return regCheck.test(str) || str === '';
};

const validPhone = (str) => {
  const regCheck = /^[^a-z]*\d+[\d ()-]*$/;
  return regCheck.test(str) || str === '';
};

const validEmail = (str) => {
  const regCheck =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regCheck.test(str) || str === '';
};

const validWebsite = (str) => {
  const regCheck = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  return regCheck.test(str) || str === '';
};

const greaterThanZero = (value) => {
  const regCheck = /^[1-9][0-9]*$/;
  return regCheck.test(value) || value === '';
};

const greaterThanZeroFloats = (value) => {
  const regCheck = /^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/;
  return regCheck.test(value) || value === '';
};

const anyFloats = (value) => {
  // const regCheck = /^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/;
  // return regCheck.test(value);
  return typeof value === 'number';
};

const onlyNumber = (value) => {
  const regCheck = /[0-9]/g;
  return regCheck.test(value) || value === '';
};

export const fieldValidations = {
  first_name: {
    validations: [alpha],
    mandatoryChecks: [mandatoryCheck],
    text: 'First Name',
  },
  last_name: {
    validations: [alpha],
    mandatoryChecks: [mandatoryCheck],
    text: 'Last Name',
  },
  email: {
    validations: [validEmail],
    mandatoryChecks: [mandatoryCheck],
    text: 'Email',
  },
  phone: {
    validations: [validPhone],
    mandatoryChecks: [mandatoryCheck],
    text: 'Phone Number',
  },
  organization_name: {
    validations: [alphanumericSpace],
    mandatoryChecks: [mandatoryCheck],
    text: 'Organization Name',
  },
  organization_address: {
    validations: [validAddress],
    mandatoryChecks: [mandatoryCheck],
    text: 'Organization Address',
  },
  organization_website: {
    validations: [validWebsite],
    mandatoryChecks: [mandatoryCheck],
    text: 'Organization Website',
  },
};
