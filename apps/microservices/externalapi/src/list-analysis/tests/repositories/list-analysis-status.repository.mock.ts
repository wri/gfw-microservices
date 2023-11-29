import { jest } from '@jest/globals';

export class ListAnalysisStatusRepositoryMock {
  findOne = jest.fn(async () => {
    return {
      listId: 123,
      analysisId: 'FCD',
      updateTime: new Date(),
      status: 2,
      s3URL: 'https://example.com/results',
      expirationTime: '11/28/2023',
    };
  });
}
