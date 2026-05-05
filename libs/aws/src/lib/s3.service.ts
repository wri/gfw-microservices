import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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

  async writeFileToS3(filePath: string, contentType: string, bucket: string, s3Key: string) {
    const fileContent = await fs.promises.readFile(filePath);
    const params = {
      Bucket: bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);
  }

  async getFileSignedUrl(
    key: string,
    fileExtension: string,
    bucket: string,
    downloadFilename?: string
  ) {
    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: `${process.env.NODE_ENV}/${key}.${fileExtension}`,
    };

    if (downloadFilename) {
      params.ResponseContentDisposition = buildContentDisposition(downloadFilename);
    }

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

  async putObject(
    key: string,
    body: Buffer | Uint8Array | string,
    bucket: string,
    contentType: string
  ) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    return await this.s3Client.send(command);
  }

  async deleteObject(key: string, bucket: string) {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await this.s3Client.send(command);
  }

  // New method to get an object from S3, convert it to JSON, and return it
  async getObjectAsJson(bucket: string, key: string): Promise<any> {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    if (response.Body instanceof Readable) {
      const s3DataString = await this.streamToString(response.Body);
      try {
        const s3DataJson = JSON.parse(s3DataString);
        return s3DataJson;
      } catch (err) {
        throw new Error(`Failed to parse JSON: ${err.message}`);
      }
    } else {
      throw new Error('Response body is not a Readable stream');
    }
  }

  async readFileFromS3(bucketName: string, key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      // send the command to S3
      const data = await this.s3Client.send(command);

      return await this.streamToString(data.Body as Readable);
    } catch (error) {
      Logger.error(`Error reading '${bucketName}'/'${key}' from S3:`, error.stack || error);
      throw error;
    }
  }

  // Helper method to convert a Readable stream to a string
  private async streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => {
        // Concatenate all Uint8Array objects into a single Uint8Array
        const concatenatedArray = new Uint8Array(
          chunks.reduce((acc, val) => acc.concat(Array.from(val)), [])
        );

        // Convert the concatenated Uint8Array to a Buffer
        const buffer = Buffer.from(concatenatedArray);

        // Convert the Buffer to a string
        const resultString = buffer.toString('utf-8');

        resolve(resultString);
      });
    });
  }
}

export function buildContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const utf8Encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
}
