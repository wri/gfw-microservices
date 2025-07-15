import { AppService } from './app.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ClientStoreConnection, DeleteListTypeOrm, Lists } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListRepositoryMock } from './test/list.repository.mock';
import { ConfigModule } from '@nestjs/config';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LockListService } from '../services/lock.list.service';

describe('AppService', () => {
  let appService: AppService;
  let lockListService: LockListService;
  let module: TestingModule;
  let clientStoreConnection: ClientStoreConnection;
  let deleteListTypeOrm: DeleteListTypeOrm;
  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(Lists)
      .returns(new ListRepositoryMock());
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Lists],
        }),
        TypeOrmModule.forFeature([Lists], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [AppService, ClientStoreConnection, DeleteListTypeOrm, LockListService],
    }).compile();
  });

  beforeEach(async () => {
    appService = module.get<AppService>(AppService);
    lockListService = module.get<LockListService>(LockListService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
    deleteListTypeOrm = module.get<DeleteListTypeOrm>(DeleteListTypeOrm);
  });
  describe('getData', () => {
    xit('should return object with presigned URL', () => {
      const preSignedUrl = appService.generatePreSignedUrl('list.csv', 'text/csv');
      expect(preSignedUrl).toHaveProperty('url');
    });
  });

  describe('Select query test', () => {
    xit('Should return a list of data', async () => {
      const result = await appService.getFilenameForUser();
      expect(result.length > 0).toBeTruthy();
    });
  });

  afterAll(() => {
    /**
     * Important close the app and connections
     * This turn down all the apps and avoid memory leaks
     */
    // app.close(), done();
  });

  describe('Delete list service', () => {
    it('should not find a list to delete', async () => {
      const listId = 123;
      const organizationDatabase = 'mockDatabase';
      const organization_user_id = 1;
      const userEmail = 'email@email.com';

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          save: () => true,
          delete: () => true,
          findOne: jest.fn().mockRejectedValue(new NotFoundException()),
        }),
        query: () => true,
      });
      await expect(
        appService.deleteList(listId, organizationDatabase, organization_user_id, userEmail)
      ).rejects.toThrowError(InternalServerErrorException);
    });
    it('should throw error on trying to delete a locked list', async () => {
      const listId = 123;
      const organizationDatabase = 'mockDatabase';
      const organization_user_id = 1;
      const userEmail = 'email@email.com';
      jest.spyOn(lockListService, 'lockList').mockResolvedValue(true);
      const mockList = {
        listId: 123,
        status: 'Completed',
        errorsDetails: [],
        resultUrl: 'https://example.com/results',
        creationDate: new Date('2023-09-28'),
        expirationDate: new Date('2023-09-28'),
        lockStatus: new Date('2023-09-28'),
        lockUserId: 12345,
        listTableName: 'list-table-name',
        listAnalysisTableName: 'analyses-table-name',
        listName: 'list-name',
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          save: () => true,
          delete: () => true,
          findOne: jest.fn().mockReturnValue(mockList),
        }),
        query: () => true,
      });

      await expect(
        appService.deleteList(listId, organizationDatabase, organization_user_id, userEmail)
      ).rejects.toThrowError(InternalServerErrorException);
    });
    it('should throw error on trying to drop database', async () => {
      const listId = 123;
      const organizationDatabase = 'mockDatabase';
      const organization_user_id = 1;
      const userEmail = 'email@email.com';
      jest.spyOn(lockListService, 'lockList').mockResolvedValue(true);
      const mockList = {
        listId: 123,
        status: 'Completed',
        errorsDetails: [],
        resultUrl: 'https://example.com/results',
        creationDate: new Date('2023-09-28'),
        expirationDate: new Date('2023-09-28'),
        lockStatus: null,
        lockUserId: null,
        listTableName: 'list-table-name',
        listAnalysisTableName: 'analyses-table-name',
        listName: 'list-name',
      };
      const mockListUpdated = {
        lockStatus: new Date('2023-09-28'),
        lockUserId: 1,
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          save: () => true,
          delete: () => true,
          findOne: jest
            .fn()
            .mockReturnValueOnce(mockList)
            .mockReturnValue({ ...mockList, ...mockListUpdated }),
        }),
        query: () => {
          throw new InternalServerErrorException();
        },
      });

      await expect(
        appService.deleteList(listId, organizationDatabase, organization_user_id, userEmail)
      ).rejects.toThrowError(InternalServerErrorException);
    });
    it('should delete a list', async () => {
      const listId = 123;
      const organizationDatabase = 'mockDatabase';
      const organization_user_id = 1;
      const userEmail = 'email@email.com';
      jest.spyOn(lockListService, 'lockList').mockResolvedValue(true);
      const mockList = {
        listId: 123,
        status: 'Completed',
        errorsDetails: [],
        resultUrl: 'https://example.com/results',
        creationDate: new Date('2023-09-28'),
        expirationDate: new Date('2023-09-28'),
        lockStatus: null,
        lockUserId: null,
        listTableName: 'list-table-name',
        listAnalysisTableName: 'analyses-table-name',
        listName: 'list-name',
      };
      const mockListUpdated = {
        lockStatus: new Date('2023-09-28'),
        lockUserId: 1,
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          save: () => true,
          delete: () => true,
          findOne: jest
            .fn()
            .mockReturnValueOnce(mockList)
            .mockReturnValue({ ...mockList, ...mockListUpdated }),
        }),
        query: () => true,
      });
      deleteListTypeOrm.delete = jest.fn().mockResolvedValue(true);
      const result = await appService.deleteList(
        listId,
        organizationDatabase,
        organization_user_id,
        userEmail
      );
      expect(result).toEqual(`User '${userEmail}' has deleted list (${mockList.listId}).`);
    });
  });
});
