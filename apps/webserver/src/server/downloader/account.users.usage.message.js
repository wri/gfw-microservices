const buildSQSMessage = (args) => {
  const { fileName, userEmail, orgDbName, startDate, endDate } = args;

  return {
    fileName,
    key: fileName,
    type: 'accountUsersUsage',
    startDate: startDate,
    endDate: endDate,
    organizationDatabase: orgDbName,
    userEmail: userEmail,
  };
};

export default buildSQSMessage;
