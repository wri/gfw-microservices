const { getConverters } = require('../controllers/converters.controller');
const { getConverterJobs } = require('../services/converters.service');
import { ConverterNamesList } from '@wri-monorepos/constants';

// Mock getConverterJobs
jest.mock('../services/converters.service', () => ({
  getConverterJobs: jest.fn(),
}));

describe('getConverters', () => {
  it('should respond with status 200 and the list of converter names and jobs', async () => {
    // Mock return value for getConverterJobs
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
      convertersNames: ConverterNamesList,
      converterJobs: mockJobs,
    });
  });
});
