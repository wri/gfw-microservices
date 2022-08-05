import { Test, TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from '../shared/database/gfw';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
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
      //try {
      const result = await appController.saveListToProcess({
        key: 'test123123-test.csv',
        userId: 13322,
        listName: 'test list name for LLP',
      });
      console.log(result);
      //} catch (e) {
      //  console.log(e);
      //}
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
