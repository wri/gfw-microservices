const { z } = require('zod');
const { fromZodError } = require('zod-validation-error');

/**
 * Maximum size for string fields to prevent oversized payloads
 */
const MAX_STRING_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 50; // Database constraint: NVARCHAR(50)
const MAX_PHONE_LENGTH = 50;
const MAX_NAME_LENGTH = 35;
const MAX_TITLE_LENGTH = 150;
const MAX_ARRAY_LENGTH = 100;

/**
 * Zod schema for /profile/updateuser endpoint
 * Only allows predefined, valid JSON keys
 */
const updateUserSchema = z
  .object({
    id: z.number().int().positive('User ID must be a positive integer'),
    first_name: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(MAX_NAME_LENGTH, `First name must not exceed ${MAX_NAME_LENGTH} characters`),
    middle_initial: z
      .string()
      .trim()
      .max(2, 'Middle initial must not exceed 2 characters')
      .optional()
      .nullable(),
    last_name: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(MAX_NAME_LENGTH, `Last name must not exceed ${MAX_NAME_LENGTH} characters`),
    email: z
      .string()
      .trim()
      .email('Invalid email format')
      .max(MAX_EMAIL_LENGTH, `Email must not exceed ${MAX_EMAIL_LENGTH} characters`),
    phone: z
      .string()
      .trim()
      .max(MAX_PHONE_LENGTH, `Phone must not exceed ${MAX_PHONE_LENGTH} characters`)
      .optional()
      .nullable(),
    title_id: z
      .number()
      .int()
      .nonnegative('Title ID must be a non-negative integer')
      .optional()
      .nullable(),
    other_title: z
      .string()
      .trim()
      .max(MAX_TITLE_LENGTH, `Other title must not exceed ${MAX_TITLE_LENGTH} characters`)
      .optional()
      .nullable(),
    access_level_id: z
      .number()
      .int()
      .positive('Access level ID must be a positive integer')
      .optional()
      .nullable(),
    enableAlerts: z
      .union([z.boolean(), z.number().int().min(0).max(1)])
      .optional()
      .nullable()
      .transform((val) => {
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val;
      }),
    geographies: z
      .array(z.number().int())
      .max(MAX_ARRAY_LENGTH, `Geographies array must not exceed ${MAX_ARRAY_LENGTH} items`)
      .optional()
      .default([]),
    commodities: z
      .array(z.number().int())
      .max(MAX_ARRAY_LENGTH, `Commodities array must not exceed ${MAX_ARRAY_LENGTH} items`)
      .optional()
      .default([]),
    auth_preference_id: z
      .number()
      .int()
      .nonnegative('Auth preference ID must be a non-negative integer')
      .optional()
      .default(0),
  })
  .strict(); // Reject any unknown keys

/**
 * Express middleware to validate request body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Check if body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Request body is required',
        });
      }

      // Check total payload size (rough estimation)
      const bodyString = JSON.stringify(req.body);
      const payloadSize = Buffer.byteLength(bodyString, 'utf8');
      const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB

      if (payloadSize > MAX_PAYLOAD_SIZE) {
        return res.status(413).json({
          error: 'Payload Too Large',
          message: `Request payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes`,
        });
      }

      // Validate against schema
      const validatedData = schema.parse(req.body);

      // Replace req.body with validated data
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod error to user-friendly message
        const validationError = fromZodError(error);

        // Check if error is due to unknown keys
        const hasUnknownKeys = error.errors.some((err) => err.code === 'unrecognized_keys');

        const isDevelopment = process.env.NODE_ENV !== 'production';

        if (hasUnknownKeys) {
          const unknownKeys = error.errors
            .filter((err) => err.code === 'unrecognized_keys')
            .flatMap((err) => ('keys' in err ? err.keys : []) || []);

          const response = {
            error: 'Bad Request',
            message: 'Invalid request: unknown fields provided',
            details: `Unrecognized key(s) in object: ${unknownKeys.join(', ')}`,
          };

          // Only include detailed validation errors in non-production environments
          if (isDevelopment) {
            response.validationErrors = error.errors;
          }

          return res.status(400).json(response);
        }

        const response = {
          error: 'Bad Request',
          message: 'Invalid request data',
          details: validationError.message,
        };

        // Only include detailed validation errors in non-production environments
        if (isDevelopment) {
          response.validationErrors = error.errors;
        }

        return res.status(400).json(response);
      }

      // Handle other errors
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request',
      });
    }
  };
};

module.exports = {
  validateRequest,
  updateUserSchema,
  MAX_STRING_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_ARRAY_LENGTH,
};
