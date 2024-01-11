import path from 'path';
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const tmp = require('tmp');

import { describe, expect, jest, it } from '@jest/globals';
const buildSQSMessage = require('./afi.message');

jest.spyOn(path, 'resolve').mockReturnValueOnce('./config/privateutils/sqs.utils');
sqsUtils.uniqueIdGenerator = jest.fn().mockReturnValue('1234567890');
tmp.tmpNameSync = jest.fn().mockReturnValue('/tmp/1234567890');

describe('Check build sqs message function', () => {
  it('Sending and empty request', () => {
    const { message, key } = new buildSQSMessage({
      query: {},
      session: {},
    });

    const { MessageAttributes } = message;

    expect(key).not.toBeUndefined();
    // cant send more than 10 parameters using SQS
    expect(MessageAttributes).toStrictEqual({
      file: {
        DataType: 'String',
        StringValue: '{"type":"afi","key":"1234567890"}',
      },
      list: {
        DataType: 'String',
        StringValue: '{}',
      },
      organizationDatabase: {
        DataType: 'String',
        StringValue: '',
      },
      userEmail: {
        DataType: 'String',
        StringValue: '',
      },
    });
  });

  it('Sending and empty request', () => {
    const { message, key } = buildSQSMessage({
      query: {
        listId: 2073,
      },
      session: {
        user_email: 'teste@wri.com',
        organization_database: 'clientdev-co',
      },
    });

    const { MessageAttributes } = message;

    expect(key).not.toBeUndefined();
    // cant send more than 10 parameters using SQS
    expect(MessageAttributes).toStrictEqual({
      file: {
        DataType: 'String',
        StringValue: '{"type":"afi","key":"1234567890"}',
      },
      list: {
        DataType: 'String',
        StringValue: '{"listId":2073}',
      },
      organizationDatabase: {
        DataType: 'String',
        StringValue: 'clientdev-co',
      },
      userEmail: {
        DataType: 'String',
        StringValue: 'teste@wri.com',
      },
    });
  });
});
