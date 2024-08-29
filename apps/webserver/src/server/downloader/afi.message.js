import tmp from 'tmp';

const buildSQSMessage = ({ request }) => {
  const { listId } = request.query;
  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  return {
    userEmail,
    organizationDatabase,
    listId,
    type: 'afi',
    key: fileName,
  };
};

export default buildSQSMessage;
