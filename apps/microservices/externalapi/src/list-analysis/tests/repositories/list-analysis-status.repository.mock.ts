import { jest } from '@jest/globals';

export class ListAnalysisStatusRepositoryMock {
  findOne = jest.fn(async () => {
    return {
      listId: 123,
      analysisId: 'FCD',
      updateTime: new Date(),
      status: 2,
      expirationTime: '11/30/2023',
      s3URL: 'https://example.com/results',
    };
  });
}
