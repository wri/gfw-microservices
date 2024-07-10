// Line below should be uncommented when is necessary to test the function for a live S3 bucket
//import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { convertShapefileToGeoJSON } from './shp2GeoJson.parser';
import * as fs from 'fs';
import { Readable } from 'stream';
jest.setTimeout(90_000);

jest.mock('fs', () => {
  // Save the original implementation
  const originalModule = jest.requireActual('fs');

  // Create a manual mock for the specific function
  return {
    ...originalModule,
    unlinkSync: jest.fn(() => 'mocked content'),
  };
});

/* this test should be uncommented when is necessary to test the function for a live S3 bucket 
describe('Test process file from S3', () => {

  const s3Bucket = 'gfwpro-lpl-dev';
  const s3Key = '3_loc.zip'; // Shapefile with 3 locations in S3 bucket
  const awsConfig = {
    credentials: {
      accessKeyId: '<USE VALID ACCESS KEY ID>',
      secretAccessKey: '<USE VALID SECRET ACCESS KEY>',
    },
    region: 'us-east-1',
  };

  it('should process file from S3 and successfully converts a shapefile to GeoJSON', async () => {
    const s3Client = new S3Client(awsConfig);
    const data = await s3Client.send(new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key }));

    const result = await convertShapefileToGeoJSON(data.Body as Readable);

    // console.log('data', JSON.stringify(result, null, 2)); // Used to see output in console

    expect(result).toMatchObject({ type: 'FeatureCollection' });
    expect(fs.unlinkSync).toHaveBeenCalled();
  });
});
*/

describe('convertShapefileToGeoJSON', () => {
  it('successfully converts a shapefile to GeoJSON', async () => {
    // Base64 encoded shapefile with 3 locations
    // Original file is in the basefiles folder named 3_loc.zip
    const base64Data =
      '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';
    const buffer = Buffer.from(base64Data, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Indicate the end of the stream

    const result = await convertShapefileToGeoJSON(stream);
    // console.log('data', JSON.stringify(result, null, 2)); // Used to see output in console
    expect(result).toMatchObject({ type: 'FeatureCollection' });
    expect(fs.unlinkSync).toHaveBeenCalled();
  });
});
