import tmp from 'tmp';

const buildSQSMessage = ({ request }) => {
  const { id: listId } = request.params;

  const { selectedTimeframe, selectedAlert, isGFWList, startDate, endDate } = request.query;

  // TODO we should rename all mentions from glad to integrated.
  const alert = selectedAlert === 'GLAD' ? 'Integrated' : selectedAlert;

  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  return {
    userEmail,
    organizationDatabase,
    selectedTimeframe,
    selectedAlert: alert,
    listId,
    isGFWList,
    type: 'alerts',
    key: fileName,
    startDate,
    endDate,
  };
};

export default buildSQSMessage;
