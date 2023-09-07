import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

xdescribe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHealthCheck', () => {
    it('should return "Healty"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHealthCheck()).toEqual('Healthy');
    });
  });
});
