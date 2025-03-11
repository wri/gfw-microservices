import moment from 'moment';

const getFormattedDateTime = (DateTime = new Date()) => {
  return moment(DateTime).format('ddd D MMM YYYY h:mm:ss A');
};

export { getFormattedDateTime };
