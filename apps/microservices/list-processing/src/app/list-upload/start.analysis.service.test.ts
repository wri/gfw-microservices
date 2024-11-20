import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { RequestLargeListProcess } from '../../models';

describe('StartAnalysisService', () => {
  let service: StartAnalysisService;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAnalysisService,
        {
          provide: getQueueToken('analysis'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
    queue = module.get<Queue>(getQueueToken('analysis'));
  });

  it('should enqueue a job', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
    };
    await service.run(request);
    expect(queue.add).toHaveBeenCalledWith('start-analysis', request);
  });
});
