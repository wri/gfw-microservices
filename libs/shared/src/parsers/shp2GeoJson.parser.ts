import * as shapefile from 'shapefile';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import type { NodeJsClient, SdkStream, StreamingBlobPayloadOutputTypes } from '@smithy/types';

const streamPipeline = promisify(pipeline);

export const convertShapefileToGeoJSON = async (data: Readable): Promise<any> => {
  const extractedFolder = './extracted';

  //AWS_ACCESS_KEY_ID=AKIAY7KBJ32RFTDIH3JD
  //AWS_SECRET_ACCESS_KEY=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
  //AWS_REGION=us-east-1

  // Ensure the extracted folder exists
  if (!fs.existsSync(extractedFolder)) {
    fs.mkdirSync(extractedFolder);
  }

  // Download the zip file from S3
  //const s3Client = new S3Client(awsConfig);
  const zipFilePath = path.join(extractedFolder, 'file.zip');
  //const data = await s3Client.send(new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key }));
  const webStream = data; //data.Body as Readable;
  await streamPipeline(webStream, fs.createWriteStream(zipFilePath));

  // const body = data.Body;
  // if (body instanceof Readable) {
  //   const writeStream = fs.createWriteStream(zipFilePath);
  //   body
  //     .pipe(writeStream)
  //     .on('error', (err) => reject(err))
  //     .on('close', () => resolve(null));
  // }
  // const stream = data.Body.transformToByteArray();
  // webStream.pipe(fs.createWriteStream(zipFilePath));
  // Unzip the file

  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: extractedFolder }))
    .promise();

  // Find the .shp file in the extracted folder
  const files = fs.readdirSync(extractedFolder);
  const shpFile = files.find((file) => path.extname(file) === '.shp');
  if (!shpFile) {
    throw new Error('Shapefile (.shp) not found in the zip archive');
  }

  const shpFilePath = path.join(extractedFolder, shpFile);

  // Convert the shapefile to GeoJSON
  return new Promise((resolve, reject) => {
    shapefile
      .read(shpFilePath)
      .then((geojson) => {
        // Clean up extracted files
        files.forEach((file) => fs.unlinkSync(path.join(extractedFolder, file)));
        resolve(geojson);
      })
      .catch((error) => {
        // Clean up extracted files in case of error
        files.forEach((file) => fs.unlinkSync(path.join(extractedFolder, file)));
        reject(error);
      });
  });
};
