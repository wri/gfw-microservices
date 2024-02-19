import { convertObjectToAWSPattern } from './utils';

const buildSQSMessage = (args) => {
  const { fileName, userEmail, orgDbName, startDate, endDate } = args;

  const messageAttributesTemplate = {
    userEmail: {
      DataType: 'String',
      StringValue: userEmail,
    },
    organizationDatabase: {
      DataType: 'String',
      StringValue: orgDbName,
    },
    startDate: {
      DataType: 'String',
      StringValue: startDate,
    },
    endDate: {
      DataType: 'String',
      StringValue: endDate,
    },
    key: {
      DataType: 'String',
      StringValue: fileName,
    },
    type: {
      DataType: 'String',
      StringValue: 'accountUsersUsage',
    },
  };

  const filters = {
    ...args,
    type: 'accountUsersUsage',
    key: fileName,
  };

  return convertObjectToAWSPattern({
    fileName,
    filters,
    messageTemplate: messageAttributesTemplate,
  });
};

export default buildSQSMessage;
