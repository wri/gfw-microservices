import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as fsp from 'fs';

@Injectable()
export class S3Service {
  async sendFiletoS3(key: string, fileExtension: string, contentType: string, bucket: string) {
    const s3 = new S3({
      apiVersion: 'v2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });

    const fileContent = fsp.readFileSync(`/tmp/${key}.${fileExtension}`);
    const params = {
      Bucket: bucket,
      Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
      Body: fileContent,
      ContentType: contentType,
    };

    await s3.upload(params).promise();
  }

  async getFileSignedUrl(key: string, fileExtension: string, bucket: string) {
    const s3 = new S3({
      signatureVersion: 'v4',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });

    const params = {
      Bucket: bucket,
      Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
      Expires: 86400,
    };

    const url = await s3.getSignedUrl('getObject', params);
    return url;
  }
  async getFileSignedUrlDinamicEnvironment(
    key: string,
    fileExtension: string,
    bucket: string,
    environment: string,
    subPath?: string
  ) {
    const s3 = new S3({
      signatureVersion: 'v4',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });

    const params = {
      Bucket: bucket,
      Key: `${environment}/${key}.${fileExtension}`,
      Expires: 86400,
    };
    if (subPath) {
      params.Key = `${environment}/${subPath}/${key}.${fileExtension}`;
    }

    const url = await s3.getSignedUrl('getObject', params);
    return url;
  }
}
