import { StartAnalysis } from './start.analysis';
import { ClientStoreConnection, updateListsAnalysisStatus } from '@wri-monorepos/sql';
import { ProcessingLimitException } from '../../app.exceptions';
import { mockAnalysisFlow } from '../../../mock';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import { getListAnalysisStatus, extractAnalysisTypes } from '@wri-monorepos/geo';
import { listStatus } from '@wri-monorepos/constants';
5;
import { DataSource } from 'typeorm'; // ou o caminho correto para o DataSource na sua aplicação

jest.mock('@wri-monorepos/sql');
jest.mock('../../../mock');
jest.mock('@wri-monorepos/shared');
jest.mock('@wri-monorepos/geo');

describe('StartAnalysis', () => {
  let startAnalysis: StartAnalysis;
  let clientStoreConnection: ClientStoreConnection;

  beforeEach(() => {
    clientStoreConnection = new ClientStoreConnection();
    startAnalysis = new StartAnalysis(clientStoreConnection);
    process.env.LARGE_LIST_PROCESSING_ENDPOINT = 'http://test.com';
    process.env.MICROSERVICES_ENV = 'DEVELOPMENT';

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ listName: 'test_list' }), // Ajuste conforme necessário
      }),
      // Adicione outras propriedades e métodos do DataSource que você usa
    } as unknown as DataSource;

    jest.spyOn(clientStoreConnection, 'getConnection').mockResolvedValue(mockDataSource);
  });

  it('should handle test flow correctly', async () => {
    process.env.MICROSERVICES_ENV = 'DEVELOPMENT';
    const input = {
      request: {
        organization_database: 'test_db',
        user_id: 1,
        listId: 1,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        path: 'test',
      },
    };

    (checkProcessingLimits as jest.Mock).mockResolvedValue({
      isListLocationOverLimit: false,
      processingLimit: 100,
    });

    jest.spyOn(startAnalysis, 'getListName').mockResolvedValue('e2e_automation_list');
    jest.spyOn(startAnalysis, 'getUserEmail').mockResolvedValue('dt_user');
    (mockAnalysisFlow as jest.Mock).mockResolvedValue(undefined);

    const result = await startAnalysis.handle(input);

    expect(mockAnalysisFlow).toHaveBeenCalled();
    expect(result).toEqual(input);
  });

  it('should throw ProcessingLimitException when limits are exceeded', async () => {
    const input = {
      request: {
        organization_database: 'test_db',
        user_id: 1,
        listId: 1,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        path: 'test',
      },
    };

    (checkProcessingLimits as jest.Mock).mockResolvedValue({
      isListLocationOverLimit: true,
      processingLimit: 100,
    });

    await expect(startAnalysis.handle(input)).rejects.toThrow(ProcessingLimitException);
    expect(updateListsAnalysisStatus).toHaveBeenCalledWith('test_db', {
      listId: 1,
      errorInfo: 'Exceeded Analysis Limit',
      status: listStatus.Inactive,
    });
  });

  it('should make API call with correct payload', async () => {
    const input = {
      request: {
        organization_database: 'test_db',
        user_id: 1,
        listId: 1,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        path: 'test',
      },
    };

    (checkProcessingLimits as jest.Mock).mockResolvedValue({
      isListLocationOverLimit: false,
      processingLimit: 100,
    });
    (getListAnalysisStatus as jest.Mock).mockResolvedValue({});
    (extractAnalysisTypes as jest.Mock).mockReturnValue(['type1', 'type2']);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;

    await startAnalysis.handle(input);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    );
  });
});
