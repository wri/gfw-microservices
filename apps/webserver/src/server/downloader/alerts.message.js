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

  const { selectedTimeframe, selectedAlert, isGFWList } = request.query;

  // TODO we should rename all mentions from glad to integrated.
  const alert = selectedAlert === 'GLAD' ? 'Integrated' : selectedAlert;

  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  const filters = {
    userEmail,
    organizationDatabase,
    selectedTimeframe,
    selectedAlert: alert,
    list: JSON.stringify({ listId, isGFWList }),
    file: JSON.stringify({ type: 'alerts', key: fileName }),
  };

  return convertObjectToAWSPattern({ fileName, filters, messageTemplate: messageSQSTemplate });
};

export default buildSQSMessage;
