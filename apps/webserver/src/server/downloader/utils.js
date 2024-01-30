import path from 'path';
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));

const convertObjectToAWSPattern = ({ fileName, filters, messageTemplate }) => {
  const messageSQS = Object.keys(filters)
    .filter((key) => Object.keys(messageTemplate).includes(key))
    .reduce((obj, key) => {
      obj[key] = { ...messageTemplate[key], StringValue: filters[key] ?? '' };
      return obj;
    }, {});

  const sqsOrderData = {
    MessageAttributes: messageSQS,
    MessageBody: JSON.stringify(messageSQS),
    MessageDeduplicationId: sqsUtils.uniqueIdGenerator(),
    MessageGroupId: sqsUtils.uniqueIdGenerator(),
    QueueUrl: process.env.AWS_TMP_QUEUE,
  };

  return {
    message: sqsOrderData,
    key: fileName,
  };
};

export { convertObjectToAWSPattern };
