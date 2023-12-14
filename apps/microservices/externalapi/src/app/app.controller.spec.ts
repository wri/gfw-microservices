import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHealthCheck', () => {
    it('should return "Healthy"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHealthCheck()).toEqual('Healthy');
    });
    it('Latest commit"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getLatestCommit()).toEqual(undefined);
    });
  });
});
