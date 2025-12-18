import { format } from 'date-fns';

const getFormattedDateTime = (DateTime = new Date()) => {
  return format(new Date(DateTime), 'EEE d MMM yyyy h:mm:ss a');
};

export { getFormattedDateTime };
