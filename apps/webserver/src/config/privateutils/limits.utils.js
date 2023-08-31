const moment = require('moment');

const calculateProcessingLimit = (accountLimits, accountUsage) => {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
};

const calculateAccountUsageStartDate = (accountActivationDate, endDate) => {
  // Calculate the startDate by subtracting one year from the endDate
  let startDate = moment(endDate).subtract(1, 'year');
  // Set the month and day to match the activation month and day
  const activationMonth = accountActivationDate.month();
  const activationDay = accountActivationDate.date();
  startDate.month(activationMonth).date(activationDay);

  // Validate that startDate is within the account activation lifetime in case newly created Org Accounts
  if (startDate.isBefore(accountActivationDate, 'day')) {
    startDate.year(accountActivationDate.year());
  }

  return startDate;
};

module.exports = {
  calculateProcessingLimit,
  calculateAccountUsageStartDate,
};
