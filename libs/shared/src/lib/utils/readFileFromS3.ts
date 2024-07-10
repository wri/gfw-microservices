import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const readFileFromS3 = async (s3Client: S3Client, bucketName, key): Promise<string> => {
  try {
    // Create a GetObjectCommand to retrieve the object
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Send the command to S3
    const data = await s3Client.send(command);

    // Stream the data and return it as a string
    const streamToString = (stream): Promise<string> =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });

    return await streamToString(data.Body);
  } catch (error) {
    console.error('Error reading from S3:', error);
    throw error;
  }
};
