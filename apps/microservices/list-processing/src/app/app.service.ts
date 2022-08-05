import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { DataSource } from 'typeorm';
import * as uniqId from 'uniqid';
import {
  ResponsePreSignedURLModel,
  ResponseObjectPresignedURLModel,
  RequestSaveLargeListProcessModel,
} from '../models';

class MyObject {
  id: number;
  list_name: string;
  list_locations_count: number;
}

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  /**
   *
   * @param key Name of the file
   * @param contentType content type of the file
   * @returns
   */
  generatePreSignedUrl(
    key: string,
    contentType: string,
    replaceFile = false
  ): ResponsePreSignedURLModel {
    const s3 = new S3({ signatureVersion: 'v2' });
    const keyFile = replaceFile ? key : `${uniqId()}-${key}`;
    const url = s3.getSignedUrl('putObject', {
      Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
      Key: keyFile,
      ContentType: contentType,
    });

    return { url, keyFile };
  }

  /**
   * Name of the file is the same as the key
   * @param key
   * @returns
   */
  getObjectPreSignedUrl(key: string): ResponseObjectPresignedURLModel {
    const s3 = new S3({ signatureVersion: 'v4' });
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
      Key: key,
      Expires: 300,
    });

    return { url };
  }

  /**
   * @param name Save list to process
   * @returns
   */
  async saveListToProcess(listDetails: RequestSaveLargeListProcessModel) {
    const queryRunner = this.dataSource.createQueryRunner();
    //await queryRunner.connect();
    //await queryRunner.startTransaction();
    const result = await queryRunner.query(
      `INSERT INTO LargeLists(organization_user_id, list_name, s3_filename, list_status, creation_date) VALUES(@0,@1,@2,'Created', GETDATE())`,
      [listDetails.userId, listDetails.listName, listDetails.key]
    );
    //await queryRunner.release();
    return result;
  }

  async getFilenameForUser(name: string): Promise<MyObject[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    //const result = await queryRunner.query(`SELECT * FROM GFWLists`);
    const result = await queryRunner.connection.getRepository(MyObject).find();
    return result;
  }
}
