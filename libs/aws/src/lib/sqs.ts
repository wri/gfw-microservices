
export const connectToSQS = (func: Function) => {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);

  const queueUrl = process.env.AWS_TMP_QUEUE;

  const app = Consumer.create({
    queueUrl,
    handleMessage: async (message) => {
      func(message);
    },
    sqs: new AWS.SQS(),
    batchSize: 10,
  });

  app.on('error', (err) => {
    console.error(err.message);
  });

  app.on('processing_error', (err) => {
    console.error(err.message);
  });
  
  logger.info('Emails service is running');
  app.start();
};