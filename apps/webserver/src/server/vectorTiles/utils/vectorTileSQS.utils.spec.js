/**
 * @jest-environment node
 */

jest.mock(
  '../config/vectorTilesSqs.config',
  () => ({
    VECTOR_TILE_SQS__QA: 'https://sqs.us-east-1.amazonaws.com/123456789/qa-vector-tiles',
    VECTOR_TILE_SQS__STAGING: 'https://sqs.us-east-1.amazonaws.com/123456789/staging-vector-tiles',
    VECTOR_TILE_SQS__PRODUCTION: 'https://sqs.us-east-1.amazonaws.com/123456789/prod-vector-tiles',
    VECTOR_TILE_SQS__LATEST: 'https://sqs.us-east-1.amazonaws.com/123456789/latest-vector-tiles',
  }),
  { virtual: true }
);

jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn(),
}));

jest.mock('sqs-consumer', () => ({
  Consumer: {
    create: jest.fn(),
  },
}));

jest.mock('./vectorTileGenerate.utils', () => ({
  generateAndStoreVectorTiles: jest.fn(),
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const { Consumer } = require('sqs-consumer');
const logger = require('../../../config/privateutils/logger.utils');
const { generateAndStoreVectorTiles } = require('./vectorTileGenerate.utils');

describe('vectorTileSQS.utils', () => {
  let mockConsumer;

  beforeEach(() => {
    mockConsumer = {
      on: jest.fn().mockReturnThis(),
      start: jest.fn(),
      stop: jest.fn(),
    };

    Consumer.create.mockReturnValue(mockConsumer);
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize SQS consumer for QA environment', async () => {
      process.env.NODE_ENV = 'qa';
      jest.isolateModules(async () => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        expect(Consumer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/qa-vector-tiles',
            handleMessage: expect.any(Function),
            batchSize: 5,
          })
        );
        expect(mockConsumer.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockConsumer.on).toHaveBeenCalledWith('processing_error', expect.any(Function));
        expect(mockConsumer.start).toHaveBeenCalled();
      });
    });

    it('should initialize SQS consumer for staging environment', () => {
      process.env.NODE_ENV = 'staging';
      jest.isolateModules(() => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        expect(Consumer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/staging-vector-tiles',
          })
        );
      });
    });

    it('should initialize SQS consumer for production environment', () => {
      process.env.NODE_ENV = 'production';
      jest.isolateModules(() => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        expect(Consumer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/prod-vector-tiles',
          })
        );
      });
    });

    it('should use latest queue for unknown environment', () => {
      process.env.NODE_ENV = 'development';
      jest.isolateModules(() => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        expect(Consumer.create).toHaveBeenCalledWith(
          expect.objectContaining({
            queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/latest-vector-tiles',
          })
        );
      });
    });

    it('should handle SQS messages and trigger tile generation', async () => {
      await jest.isolateModulesAsync(async () => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        const handleMessage = Consumer.create.mock.calls[0][0].handleMessage;
        const mockMessage = {
          Body: JSON.stringify({
            organization_database: 'test_db',
            organization_id: 456,
            list_id: 123,
          }),
          Attributes: {
            ApproximateFirstReceiveTimestamp: '1640000000000',
          },
        };

        generateAndStoreVectorTiles.mockResolvedValue({
          message: 'Tiles generated successfully',
        });

        await handleMessage(mockMessage);

        // Wait for promise chain to complete
        await new Promise((resolve) => setImmediate(resolve));

        expect(generateAndStoreVectorTiles).toHaveBeenCalledWith(
          expect.objectContaining({
            messageTimestamp: 1640000000000,
            session: {
              isNodeServer: true,
              organization_database: 'test_db',
              organization_id: 456,
            },
          }),
          123
        );
        expect(logger.info).toHaveBeenCalledWith(
          'SUCCESSFUL VECTOR TILE TRIGGER/GENERATION',
          'Tiles generated successfully'
        );
      });
    });

    it('should log errors when tile generation fails', async () => {
      await jest.isolateModulesAsync(async () => {
        const { initialize } = require('./vectorTileSQS.utils');
        initialize();

        const handleMessage = Consumer.create.mock.calls[0][0].handleMessage;
        const mockMessage = {
          Body: JSON.stringify({
            organization_database: 'test_db',
            organization_id: 456,
            list_id: 123,
          }),
          Attributes: {
            ApproximateFirstReceiveTimestamp: '1640000000000',
          },
        };

        generateAndStoreVectorTiles.mockRejectedValue({
          message: 'Generation failed',
        });

        await handleMessage(mockMessage);

        // Wait for promise chain to complete
        await new Promise((resolve) => setImmediate(resolve));

        expect(logger.error).toHaveBeenCalledWith(
          'VECTOR TILE GENERATION FAILED',
          'Generation failed'
        );
      });
    });
  });
});
