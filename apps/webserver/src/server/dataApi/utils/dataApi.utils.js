const { S3, config } = require('aws-sdk');

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

module.exports = (key, contentType) => {
  const s3 = new S3({ signatureVersion: 'v2' });
  const url = s3.getSignedUrl('putObject', {
    Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return url;
};
