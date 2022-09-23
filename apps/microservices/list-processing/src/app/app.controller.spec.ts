import {
  RequestLargeListProcess,
  RequestTriggerProcessLargeList,
} from './../models/index';
import { LargeListService } from './../services/largelist.service';
import { Test, TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from '../shared/database/gfw';
import sql = require('mssql');
import * as uniqId from 'uniqid';

describe('AppController', () => {
  let app: TestingModule;

  beforeEach((): void => {
    jest.setTimeout(60000);
  });

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, LargeListService],
      imports: [
        AppModule,
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({ useClass: DatabaseService }),
      ],
    }).compile();
  });

  describe('Upload a single file with a presigned url', () => {
    it('Controller should return PresignedURL from Service', async () => {
      const appController = app.get<AppController>(AppController);
      const presignedURL = appController.generatePreSignedUrl({
        key: 'test.csv',
        contentType: 'text/csv',
      });

      expect(presignedURL).toHaveProperty('url');
      const currentPath = process.cwd();
      const file = fs.readFileSync(currentPath + '/test_files/test.csv');

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: file,
      };

      const response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);
    });
  });

  describe('Flow process to upload a file and then replace it', () => {
    it('Should return a presigned URL upload a new file and then make a replacement for this file', async () => {
      const appController = app.get<AppController>(AppController);
      let presignedURL = appController.generatePreSignedUrl({
        key: 'test.csv',
        contentType: 'text/csv',
      });

      const fileNameToReplace = presignedURL.keyFile;

      expect(presignedURL).toHaveProperty('url');

      const currentPath = process.cwd();

      const file = fs.readFileSync(currentPath + '/test_files/test.csv');
      const replacementFileContent = fs.readFileSync(
        currentPath + '/test_files/test-replacement.csv'
      );

      let requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: file,
      };

      let response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);

      presignedURL = appController.generatePreSignedUrl({
        key: fileNameToReplace,
        contentType: 'text/csv',
        replaceFile: true,
      });

      requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'text/csv' },
        body: replacementFileContent,
      };

      response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);
    });
  });

  describe('getObjectPresignedURL', () => {
    it('Get a presigned URL to Download a file previously uploaded', () => {
      const appController = app.get<AppController>(AppController);
      const url = appController.getObjectPresignedURL({
        key: 'test.csv',
      });
      expect(url).toHaveProperty('url');
    });
  });

  describe('saveListToProcess', () => {
    it('Should save a list to process', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.saveListToProcess({
        key: 'test123123-test.csv',
        userId: 13322,
        listName: 'test list name for LLP',
      });
      expect(result).not.toBeUndefined();
      console.log(result);
    });
  });

  describe('Start large list process', () => {
    it('Should start a list analysis process', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.processLargeList({
        organization_id: 1,
        list_id: 2082,
        path: 's3://gfwpro-geotrellis-pre-data/TESTING/cocoa_generic_point.zip',
        template_type: 'cocoa_generic',
        user_id: 10011,
        startAnalysis: true,
      });

      expect(result).toEqual({
        executionArn: expect.any(String),
        startDate: expect.any(Number),
      });
    });
  });

  describe('Large list process', () => {
    it('Start large list process', async () => {
      const appController = app.get<AppController>(AppController);
      const listName = `Implementation For LargeListProccess${uniqId()}`;
      const userId = 22;
      const requestLargeListCreation: RequestTriggerProcessLargeList = {
        list_name: listName,
        user_id: userId,
      };
      const result = await appController.triggerProcessLargeList(
        requestLargeListCreation
      );

      expect(result).toEqual({
        list_id: expect.any(Number),
      });
    });
  });

  describe('Whole Process to upload large list and trigguer the proccess', () => {
    it('Upload file, Save the list and trigguer the proccess', async () => {
      const appController = app.get<AppController>(AppController);
      // Variables to be used for test
      const listName = `Implementation For LargeListProccess${uniqId()}`;
      const userId = 10034; // Ismael ID

      // Generate presigned URL to upload file
      const presignedURL = appController.generatePreSignedUrl({
        key: 'cocoa_generic_point.zip',
        contentType: 'application/zip',
      });

      expect(presignedURL).toHaveProperty('url');

      // Upload the file to presigned URL
      const currentPath = process.cwd();
      const file = fs.readFileSync(
        currentPath + '/test_files/cocoa_generic_point.zip'
      );

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/zip' },
        body: file,
      };

      const response = await fetch(presignedURL.url, requestOptions);
      expect(response.status).toBe(200);

      const requestLargeListProcess: RequestTriggerProcessLargeList = {
        list_name: listName,
        user_id: userId,
      };
      const trigguerProccessResult =
        await appController.triggerProcessLargeList(requestLargeListProcess);

      expect(trigguerProccessResult).toEqual({
        list_id: expect.any(Number),
      });

      const trigguerLargeListProcessResult =
        await appController.processLargeList({
          organization_id: 1,
          list_id: trigguerProccessResult.list_id,
          path: presignedURL.fileS3Route,
          template_type: 'cocoa_generic',
          user_id: userId,
          startAnalysis: true,
        });

      expect(trigguerLargeListProcessResult).toEqual({
        executionArn: expect.any(String),
        startDate: expect.any(Number),
      });
    });
  });

  afterAll((done) => {
    /**
     * Important close the app and connections
     * This turn down all the apps and avoid memory leaks
     */
    app.close(), done();
  });
});
