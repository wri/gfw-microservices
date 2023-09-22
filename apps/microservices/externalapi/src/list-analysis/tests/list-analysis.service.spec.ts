import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from '../list-analysis.service';

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListAnalysisService],
    }).compile();

    service = module.get<ListAnalysisService>(ListAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get analysis status', async () => {
    const listID = '123';
    const expectedResult = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: '2023-09-21',
      expirationDate: '2023-09-28',
    };

    const result = await service.getAnalysisStatus(listID);

    expect(result).toEqual(expectedResult);
  });
});
