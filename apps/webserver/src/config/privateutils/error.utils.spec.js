const { errorSanitizationMiddleware, sanitizeErrorForClient } = require('./error.utils');

describe('Error Sanitization', () => {
  describe('sanitizeErrorForClient', () => {
    it('should strip systemMessage from error object', () => {
      const error = {
        errorCode: 'TEST_ERROR',
        userMessage: 'User friendly message',
        systemMessage: 'Sensitive database info: Server=sql-server-123',
      };

      const result = sanitizeErrorForClient(error);

      expect(result).toEqual({
        errorCode: 'TEST_ERROR',
        userMessage: 'User friendly message',
      });
      expect(result.systemMessage).toBeUndefined();
    });

    it('should handle errors without systemMessage', () => {
      const error = {
        errorCode: 'TEST_ERROR',
        userMessage: 'User friendly message',
      };

      const result = sanitizeErrorForClient(error);

      expect(result).toEqual(error);
    });

    it('should return generic error for non-error objects', () => {
      const data = { status: 'success', data: [1, 2, 3] };
      const result = sanitizeErrorForClient(data);
      // The function returns a generic error for non-error objects
      expect(result).toEqual({
        errorCode: 'internalServerError',
        userMessage: 'An unexpected error occurred. Please try again later.',
      });
    });
  });

  describe('errorSanitizationMiddleware', () => {
    let req, res, next, originalSend, originalJson;

    beforeEach(() => {
      req = {};
      originalSend = jest.fn();
      originalJson = jest.fn();
      res = {
        send: originalSend,
        json: originalJson,
      };
      next = jest.fn();
    });

    it('should intercept res.send and sanitize error with systemMessage', () => {
      errorSanitizationMiddleware(req, res, next);

      const error = {
        errorCode: 'TEST_ERROR',
        userMessage: 'User friendly message',
        systemMessage: 'Sensitive: SQL error at line 42',
      };

      res.send(error);

      expect(originalSend).toHaveBeenCalled();
      const sentData = originalSend.mock.calls[0][0];
      expect(sentData.systemMessage).toBeUndefined();
      expect(sentData.errorCode).toBe('TEST_ERROR');
      expect(sentData.userMessage).toBe('User friendly message');
    });

    it('should intercept res.json and sanitize error with systemMessage', () => {
      errorSanitizationMiddleware(req, res, next);

      const error = {
        errorCode: 'TEST_ERROR',
        userMessage: 'User friendly message',
        systemMessage: 'Sensitive database details',
      };

      res.json(error);

      expect(originalJson).toHaveBeenCalled();
      const sentData = originalJson.mock.calls[0][0];
      expect(sentData.systemMessage).toBeUndefined();
    });

    it('should not modify valid responses without error patterns', () => {
      errorSanitizationMiddleware(req, res, next);

      const validResponse = {
        status: 'success',
        data: { id: 1, name: 'Test' },
        message: 'Operation successful',
      };

      res.json(validResponse);

      expect(originalJson).toHaveBeenCalled();
      const sentData = originalJson.mock.calls[0][0];
      expect(sentData).toEqual(validResponse);
    });

    it('should handle arrays and primitives without modification', () => {
      errorSanitizationMiddleware(req, res, next);

      res.send([1, 2, 3]);
      expect(originalSend.mock.calls[0][0]).toEqual([1, 2, 3]);

      res.send('string response');
      expect(originalSend.mock.calls[1][0]).toBe('string response');
    });

    it('should call next() to continue middleware chain', () => {
      errorSanitizationMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
