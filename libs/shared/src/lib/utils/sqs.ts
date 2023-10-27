import { Logger } from '@nestjs/common';
import * as SQS from '@aws-sdk/client-sqs';

export const RemoveSQSMessage = async (message: SQS.Message, queueUrl: string) => {
  const awsConfig = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  };

  const sqs = new SQS.SQS(awsConfig);

  const deleteParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.ReceiptHandle,
  };

  const removedMessage = await sqs.deleteMessage(deleteParams);
  Logger.log(`Removed message: ${JSON.stringify(removedMessage)}`);
};
