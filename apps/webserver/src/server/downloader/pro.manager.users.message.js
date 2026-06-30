const buildSQSMessage = (args) => {
  const { fileName, userEmail } = args;

  return {
    file: fileName,
    key: fileName,
    type: 'proManagerUsers',
    userEmail,
  };
};

export default buildSQSMessage;
