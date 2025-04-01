const buildSQSMessage = (args) => {
  const { fileName, userEmail, organizationDatabase, startDate, endDate } = args;

  return {
    file: fileName,
    key: fileName,
    type: 'accountUsersUsage',
    startDate,
    endDate,
    organizationDatabase,
    userEmail,
  };
};

export default buildSQSMessage;
