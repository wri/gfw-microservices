import { jest } from '@jest/globals';

export class ListRepositoryMock {
  findOne = jest.fn(() => {
    return {
      listId: 123,
      analysisId: 'FCD',
      updateTime: new Date(),
      status: 2,
      s3URL: 'https://example.com/results',
      expirationTime: new Date('11/28/2999'),
    };
  });
}
