const { getConverters } = require('../controllers/converters.controller');
import { CONVERTER_NAMES } from '@wri-monorepos/constants';

describe('getConverters', () => {
  it('should respond with status 200 and the list of converters', () => {
    // Mock req/res
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Call the controller
    getConverters(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ converters: CONVERTER_NAMES });
  });
});