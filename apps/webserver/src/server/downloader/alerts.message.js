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
  selectedTimeframe: {
    DataType: 'String',
    StringValue: '',
  },
  selectedAlert: {
    DataType: 'String',
    StringValue: '',
  },
  key: {
    DataType: 'String',
    StringValue: '',
  },
};

const buildSQSMessage = ({ request }) => {
  const { id: listId } = request.params;

  const { selectedTimeframe, selectedAlert } = request.query;

  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  const filters = {
    userEmail,
    organizationDatabase,
    selectedTimeframe,
    selectedAlert,
    list: JSON.stringify({ listId }),
    file: JSON.stringify({ type: 'alerts', key: fileName }),
  };

  return convertObjectToAWSPattern({ fileName, filters, messageTemplate: messageSQSTemplate });
};

export default buildSQSMessage;
