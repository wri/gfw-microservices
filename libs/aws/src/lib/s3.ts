
import * as  AWS from 'aws-sdk';
import * as fs from 'fs';

export const sendCSVtoS3 = async (key: string, fileExtension: string, contentType: string) => {
  const s3 = new AWS.S3({
    apiVersion: 'v2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  const fileContent = fs.readFileSync(`/tmp/${key}.${fileExtension}`);
  const params = {
    Bucket: process.env.AWS_TMP_BUCKET,
    Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
    Body: fileContent,
    ContentType: contentType,
  };

  await s3.upload(params).promise();
};

export const getFileSignedUrl = async (key: string, fileExtension: string) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  const params = {
    Bucket: process.env.AWS_TMP_BUCKET,
    Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
    Expires: 86400,
  };

  const url = await s3.getSignedUrl('getObject', params);
  return url;
};