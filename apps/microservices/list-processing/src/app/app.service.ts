import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { DataSource } from 'typeorm';
import * as uniqId from 'uniqid';
import {
  ResponsePreSignedURLModel,
  ResponseObjectPresignedURLModel,
  RequestSaveLargeListProcessModel,
  CreateListInsertResultModel,
} from '../models';
import { SQLUtils } from '@wri-monorepos/sql';
import * as sql from 'mssql';

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
    const fileS3Route = `s3://${process.env.LARGE_PROCESING_LIST_BUCKET}/${keyFile}`;
    const url = s3.getSignedUrl('putObject', {
      Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
      Key: keyFile,
      ContentType: contentType,
      Expires: 3600,
    });

    return { url, keyFile, fileS3Route };
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
  async saveListToProcess(
    listDetails: RequestSaveLargeListProcessModel
  ): Promise<CreateListInsertResultModel> {
    const fileS3Route = `s3://${process.env.LARGE_PROCESING_LIST_BUCKET}/${listDetails.key}`;
    const sqlConfig = {
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: listDetails.client_database,
      server: process.env.MSSQL_HOSTNAME,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        trustServerCertificate: true, // change to true for local dev / self-signed certs
      },
    };

    try {
      const connection = new SQLUtils(sqlConfig);
      await connection.connect();
      await connection.query(
        `INSERT INTO LargeLists(list_id, organization_user_id, list_name, s3_filename, s3_location, list_status, creation_date) VALUES(@list_id,@organization_user_id,@list_name,@s3_filename,@s3_location,'Created', GETDATE());`,
        [
          {
            field: 'list_id',
            type: sql.Int,
            value: listDetails.list_id,
          },
          {
            field: 'organization_user_id',
            type: sql.Int,
            value: listDetails.userId,
          },
          {
            field: 'list_name',
            type: sql.NVarChar,
            value: listDetails.listName,
          },
          {
            field: 's3_filename',
            type: sql.NVarChar,
            value: listDetails.key,
          },
          {
            field: 's3_location',
            type: sql.NVarChar,
            value: fileS3Route,
          },
        ]
      );
      const dataResult: CreateListInsertResultModel = {
        list_id: listDetails.list_id, //result.records[0].id,
        s3_location: fileS3Route,
      };
      return dataResult;
    } catch (error) {
      console.log(error);
    }
  }

  async getFilenameForUser(): Promise<MyObject[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    //const result = await queryRunner.query(`SELECT * FROM GFWLists`);
    const result = await queryRunner.connection.getRepository(MyObject).find();
    return result;
  }

  /**
   * Healthcheck for fargate
   */
  getHealthCheck(): string {
    return 'Healthy';
  }
}
