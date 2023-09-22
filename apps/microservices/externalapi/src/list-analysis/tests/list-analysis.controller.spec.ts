import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { Request } from 'node-fetch';

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListAnalysisController],
      providers: [ListAnalysisService],
    }).compile();

    controller = module.get<ListAnalysisController>(ListAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return analysis status', async () => {
    const listID = '123';
    const expectedResult = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: '2023-09-21',
      expirationDate: '2023-09-28',
    };

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listID}/analysis/FCD/status`,
      headers: {
        'x-api-key': 'your-api-key',
      },
    }) as Request;

    const result = await controller.getAnalysisStatus(listID, requestMock);

    expect(result).toEqual(expectedResult);
  });
});
