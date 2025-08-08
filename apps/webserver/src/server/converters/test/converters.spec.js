jest.mock('../services/converters.service', () => ({
  getConverterJobs: jest.fn(),
}));

// Mock the constants package
jest.mock('@wri-monorepos/constants', () => ({
  CONVERTER_NAMES: ['converter1', 'converter2'],
}));

// Mock the logger so it doesn't throw or print during tests
jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Now import the modules after mocks are set up
import { getConverterJobs } from '../services/converters.service';
import { getConverters } from '../controllers/converters.controller';
import { CONVERTER_NAMES } from '@wri-monorepos/constants';

describe('getConverters', () => {
  it('should respond with status 200 and the list of converter names and jobs', async () => {
    const mockJobs = [{ id: 1, name: 'test-job' }];
    getConverterJobs.mockResolvedValue(mockJobs);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getConverters(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      convertersNames: CONVERTER_NAMES,
      converterJobs: mockJobs,
    });
  });
});
