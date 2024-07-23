import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import { finished } from 'stream/promises';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async sendFiletoS3(key: string, fileExtension: string, contentType: string, bucket: string) {
    const fileContent = await fs.promises.readFile(`/tmp/${key}.${fileExtension}`);
    const params = {
      Bucket: bucket,
      Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
      Body: fileContent,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);
  }

  async getFileSignedUrl(key: string, fileExtension: string, bucket: string) {
    const params = {
      Bucket: bucket,
      Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
      Expires: 86400,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
    return url;
  }

  async getFileSignedUrlDynamicEnvironment(
    key: string,
    fileExtension: string,
    bucket: string,
    environment: string,
    subPath?: string
  ) {
    const params = {
      Bucket: bucket,
      Key: `${environment}/${key}.${fileExtension}`,
      Expires: 86400,
    };

    if (subPath) {
      params.Key = `${environment}/${subPath}/${key}.${fileExtension}`;
    }

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
    return url;
  }

  async writeS3fileIntoTmp(fileName: string, bucket: string) {
    const params = {
      Bucket: bucket,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    const filePath = `/tmp/${fileName}`;
    const file = fs.createWriteStream(filePath);

    if (response.Body instanceof Readable) {
      response.Body.pipe(file);
      await finished(file);
    } else {
      throw new Error('Response body is not a Readable stream');
    }

    return filePath;
  }
}
