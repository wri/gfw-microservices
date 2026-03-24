const { validateRequest, updateUserSchema } = require('./validation.middleware');
const { z } = require('zod');

describe('validation.middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validateRequest', () => {
    describe('empty or missing body', () => {
      it('should return 400 when body is empty object', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {};

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Bad Request',
          message: 'Request body is required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 400 when body is null', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = null;

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Bad Request',
          message: 'Request body is required',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('payload size validation', () => {
      it('should return 413 when payload exceeds maximum size', () => {
        const middleware = validateRequest(updateUserSchema);
        // Create a payload larger than 10KB
        const largeString = 'a'.repeat(15000);
        mockReq.body = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          random_large_field: largeString,
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(413);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Payload Too Large',
          message: expect.stringContaining('Request payload exceeds maximum size'),
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should accept payload within size limits', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('unknown keys validation', () => {
      it('should reject request with unknown keys', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          random: 'unexpected_value',
          another_unknown: 'value',
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Bad Request',
            message: 'Invalid request: unknown fields provided',
            details: expect.stringContaining('Unrecognized key(s)'),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject request with single unknown key', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          malicious_field: 'data',
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Bad Request',
            message: 'Invalid request: unknown fields provided',
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('valid request', () => {
      it('should accept valid minimal request', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockReq.body).toMatchObject({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        });
      });

      it('should accept valid complete request', () => {
        const middleware = validateRequest(updateUserSchema);
        mockReq.body = {
          id: 123,
          first_name: 'Jane',
          middle_initial: 'M',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0100',
          title_id: 5,
          other_title: 'Senior Engineer',
          access_level_id: 2,
          enableAlerts: true,
          geographies: [1, 2, 3],
          commodities: [10, 20],
          auth_preference_id: 1,
          marketing_email_opt_out: true,
        };

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateUserSchema', () => {
    describe('required fields', () => {
      it('should reject when id is missing', () => {
        const data = {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });

      it('should reject when first_name is missing', () => {
        const data = {
          id: 1,
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });

      it('should reject when last_name is missing', () => {
        const data = {
          id: 1,
          first_name: 'John',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });

      it('should reject when email is missing', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });
    });

    describe('id validation', () => {
      it('should reject negative id', () => {
        const data = {
          id: -1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow('User ID must be a positive integer');
      });

      it('should reject zero id', () => {
        const data = {
          id: 0,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow('User ID must be a positive integer');
      });

      it('should reject non-integer id', () => {
        const data = {
          id: 1.5,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });
    });

    describe('name validation', () => {
      it('should reject empty first_name', () => {
        const data = {
          id: 1,
          first_name: '',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow('First name is required');
      });

      it('should reject first_name exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'a'.repeat(36),
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'First name must not exceed 35 characters'
        );
      });

      it('should reject last_name exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'a'.repeat(36),
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Last name must not exceed 35 characters'
        );
      });

      it('should trim whitespace from names', () => {
        const data = {
          id: 1,
          first_name: '  John  ',
          last_name: '  Doe  ',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.first_name).toBe('John');
        expect(result.last_name).toBe('Doe');
      });

      it('should accept valid middle_initial', () => {
        const data = {
          id: 1,
          first_name: 'John',
          middle_initial: 'M',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.middle_initial).toBe('M');
      });

      it('should reject middle_initial exceeding 2 characters', () => {
        const data = {
          id: 1,
          first_name: 'John',
          middle_initial: 'ABC',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Middle initial must not exceed 2 characters'
        );
      });
    });

    describe('email validation', () => {
      it('should reject invalid email format', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'invalid-email',
        };

        expect(() => updateUserSchema.parse(data)).toThrow('Invalid email format');
      });

      it('should reject email exceeding max length', () => {
        const longEmail = 'a'.repeat(39) + '@example.com'; // 51 chars (39 + 12)
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: longEmail,
        };

        expect(() => updateUserSchema.parse(data)).toThrow('Email must not exceed 50 characters');
      });

      it('should accept valid email', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.email).toBe('john.doe@example.com');
      });
    });

    describe('phone validation', () => {
      it('should accept valid phone', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1-555-0100',
        };

        const result = updateUserSchema.parse(data);
        expect(result.phone).toBe('+1-555-0100');
      });

      it('should reject phone exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1'.repeat(51),
        };

        expect(() => updateUserSchema.parse(data)).toThrow('Phone must not exceed 50 characters');
      });
    });

    describe('title validation', () => {
      it('should accept valid title_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          title_id: 5,
        };

        const result = updateUserSchema.parse(data);
        expect(result.title_id).toBe(5);
      });

      it('should accept valid other_title', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          other_title: 'Custom Title',
        };

        const result = updateUserSchema.parse(data);
        expect(result.other_title).toBe('Custom Title');
      });

      it('should reject other_title exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          other_title: 'a'.repeat(151),
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Other title must not exceed 150 characters'
        );
      });
    });

    describe('array validation', () => {
      it('should accept valid geographies array', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          geographies: [1, 2, 3, 4],
        };

        const result = updateUserSchema.parse(data);
        expect(result.geographies).toEqual([1, 2, 3, 4]);
      });

      it('should accept valid commodities array', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          commodities: [10, 20, 30],
        };

        const result = updateUserSchema.parse(data);
        expect(result.commodities).toEqual([10, 20, 30]);
      });

      it('should reject geographies array exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          geographies: Array.from({ length: 101 }, (_, i) => i),
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Geographies array must not exceed 100 items'
        );
      });

      it('should reject commodities array exceeding max length', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          commodities: Array.from({ length: 101 }, (_, i) => i),
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Commodities array must not exceed 100 items'
        );
      });

      it('should default geographies to empty array if not provided', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.geographies).toEqual([]);
      });

      it('should default commodities to empty array if not provided', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.commodities).toEqual([]);
      });
    });

    describe('enableAlerts validation', () => {
      it('should accept boolean true', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          enableAlerts: true,
        };

        const result = updateUserSchema.parse(data);
        expect(result.enableAlerts).toBe(1);
      });

      it('should accept boolean false', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          enableAlerts: false,
        };

        const result = updateUserSchema.parse(data);
        expect(result.enableAlerts).toBe(0);
      });

      it('should accept number 0', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          enableAlerts: 0,
        };

        const result = updateUserSchema.parse(data);
        expect(result.enableAlerts).toBe(0);
      });

      it('should accept number 1', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          enableAlerts: 1,
        };

        const result = updateUserSchema.parse(data);
        expect(result.enableAlerts).toBe(1);
      });

      it('should reject invalid enableAlerts value', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          enableAlerts: 5,
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });
    });

    describe('auth_preference_id validation', () => {
      it('should accept valid auth_preference_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          auth_preference_id: 1,
        };

        const result = updateUserSchema.parse(data);
        expect(result.auth_preference_id).toBe(1);
      });

      it('should default auth_preference_id to 0 if not provided', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.auth_preference_id).toBe(0);
      });

      it('should reject negative auth_preference_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          auth_preference_id: -1,
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Auth preference ID must be a non-negative integer'
        );
      });
    });

    describe('access_level_id validation', () => {
      it('should accept valid access_level_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          access_level_id: 2,
        };

        const result = updateUserSchema.parse(data);
        expect(result.access_level_id).toBe(2);
      });

      it('should reject negative access_level_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          access_level_id: -1,
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Access level ID must be a positive integer'
        );
      });

      it('should reject zero access_level_id', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          access_level_id: 0,
        };

        expect(() => updateUserSchema.parse(data)).toThrow(
          'Access level ID must be a positive integer'
        );
      });
    });

    describe('marketing_email_opt_out validation', () => {
      it('should accept boolean true', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          marketing_email_opt_out: true,
        };

        const result = updateUserSchema.parse(data);
        expect(result.marketing_email_opt_out).toBe(true);
      });

      it('should accept boolean false', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          marketing_email_opt_out: false,
        };

        const result = updateUserSchema.parse(data);
        expect(result.marketing_email_opt_out).toBe(false);
      });

      it('should default to false if not provided', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        };

        const result = updateUserSchema.parse(data);
        expect(result.marketing_email_opt_out).toBe(false);
      });

      it('should reject non-boolean value', () => {
        const data = {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          marketing_email_opt_out: 'yes',
        };

        expect(() => updateUserSchema.parse(data)).toThrow();
      });
    });
  });
});
