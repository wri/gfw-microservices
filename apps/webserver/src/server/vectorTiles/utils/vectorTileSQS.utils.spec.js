const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const vectorTileSQSUtils = require('./vectorTileSQS.utils');
const AWS = require('aws-sdk');

jest.mock('aws-sdk');

describe('vectorTileSQS.utils', () => {
  let mockSQS;

  beforeEach(() => {
    mockSQS = {
      sendMessage: jest.fn(),
      receiveMessage: jest.fn(),
      deleteMessage: jest.fn(),
    };

    AWS.SQS.mockImplementation(() => mockSQS);
    jest.clearAllMocks();
  });

  describe('sendGenerateMessage', () => {
    it('should send generation message to SQS queue', async () => {
      mockSQS.sendMessage.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ MessageId: 'msg123' }),
      });

      const result = await vectorTileSQSUtils.sendGenerateMessage({
        listId: 'list123',
        userId: 'user456',
      });

      expect(result).toHaveProperty('MessageId', 'msg123');
      expect(mockSQS.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          QueueUrl: expect.any(String),
          MessageBody: expect.stringContaining('list123'),
        })
      );
    });

    it('should include all required parameters in message', async () => {
      mockSQS.sendMessage.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ MessageId: 'msg123' }),
      });

      await vectorTileSQSUtils.sendGenerateMessage({
        listId: 'list123',
        userId: 'user456',
        priority: 'high',
      });

      const call = mockSQS.sendMessage.mock.calls[0][0];
      const messageBody = JSON.parse(call.MessageBody);

      expect(messageBody).toHaveProperty('listId', 'list123');
      expect(messageBody).toHaveProperty('userId', 'user456');
      expect(messageBody).toHaveProperty('priority', 'high');
    });

    it('should handle SQS errors', async () => {
      mockSQS.sendMessage.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Queue unavailable')),
      });

      await expect(vectorTileSQSUtils.sendGenerateMessage({ listId: 'list123' })).rejects.toThrow(
        'Queue unavailable'
      );
    });
  });

  describe('receiveMessages', () => {
    it('should receive messages from SQS queue', async () => {
      mockSQS.receiveMessage.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Messages: [{ MessageId: 'msg1', Body: JSON.stringify({ listId: 'list123' }) }],
        }),
      });

      const result = await vectorTileSQSUtils.receiveMessages();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('MessageId', 'msg1');
    });

    it('should return empty array when no messages', async () => {
      mockSQS.receiveMessage.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });

      const result = await vectorTileSQSUtils.receiveMessages();

      expect(result).toEqual([]);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message from queue', async () => {
      mockSQS.deleteMessage.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });

      await vectorTileSQSUtils.deleteMessage('receipt123');

      expect(mockSQS.deleteMessage).toHaveBeenCalledWith({
        QueueUrl: expect.any(String),
        ReceiptHandle: 'receipt123',
      });
    });
  });
});
