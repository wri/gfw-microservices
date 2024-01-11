import tmp from 'tmp';
import { convertObjectToAWSPattern } from './utils';

const messageSQSTemplate = {
  list: {
    DataType: 'String',
    StringValue: '',
  },
  userEmail: {
    DataType: 'String',
    StringValue: '',
  },
  organizationDatabase: {
    DataType: 'String',
    StringValue: '',
  },
  file: {
    DataType: 'String',
    StringValue: '',
  },
  key: {
    DataType: 'String',
    StringValue: '',
  },
};

const buildSQSMessage = (request) => {
  const { listId } = request.query;
  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  const filters = {
    userEmail,
    organizationDatabase,
    list: JSON.stringify({ listId }),
    file: JSON.stringify({ type: 'afi', key: fileName }),
  };

  return convertObjectToAWSPattern({fileName, filters, messageTemplate: messageSQSTemplate});
}

export default buildSQSMessage;
