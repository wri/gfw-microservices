import { AppModule } from './app.module';
import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [AppService],
      imports: [AppModule],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return object with presigned URL', () => {
      const preSignedUrl = service.generatePreSignedUrl('list.csv', 'text/csv');
      expect(preSignedUrl).toHaveProperty('url');
    });
  });

  describe('Select query test', () => {
    xit('Should return a list of data', async () => {
      const result = await service.getFilenameForUser();
      expect(result.length > 0).toBeTruthy();
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
