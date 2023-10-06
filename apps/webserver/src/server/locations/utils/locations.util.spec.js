import path from 'path';
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const tmp = require('tmp');

import { expect, jest, it } from '@jest/globals';
const { buildSQSMessage } = require('./locations.utils');

jest.spyOn(path, 'resolve').mockReturnValueOnce('./config/privateutils/sqs.utils');
sqsUtils.uniqueIdGenerator = jest.fn().mockReturnValue('1234567890');
tmp.fileSync = jest.fn().mockReturnValue({ name: '/tmp/1234567890' });

describe('Check build sqs message function', () => {
  it('Sending all parameters and messageAttributes should have less than 10 objects', () => {
    const { message, key } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          analysisAreaMax: 0,
          analysisAreaMin: 10,
          combinedColumns: 'Company Name',
          country: 'Brasil',
          listFilterStr: 'text',
          order: 'desc',
          selectedLocations: '1,2,3,4,5',
          sortByAttribute: 'Location Name',
          state: 'Rio de Janeiro',
          subState: 'Taquara',
          type: 'result',
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;

    expect(key).not.toBeUndefined();
    // cant send more than 10 parameters using SQS
    expect(Object.keys(MessageAttributes).length).toBeLessThanOrEqual(6);
  });

  it('AnalysisArea should be sent as string inside the MessageAttributes', () => {
    const { message } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          analysisAreaMax: 10,
          analysisAreaMin: 0,
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;
    const { analysisArea } = MessageAttributes;
    const { StringValue } = analysisArea;

    expect(StringValue).toContain('"analysisAreaMin":0');
    expect(StringValue).toContain('"analysisAreaMax":10');
  });

  it('AnalysisArea should be sent as string inside the MessageAttributes', () => {
    const { message } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          analysisAreaMin: 2,
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;
    const { analysisArea } = MessageAttributes;
    const { StringValue } = analysisArea;

    expect(StringValue).toContain('"analysisAreaMin":2');
    expect(StringValue).not.toContain('"analysisAreaMax"');
  });

  it('Should group aggregate, type, fileName, file, combinedColumns, order, sortByAttribute into file to send', () => {
    const { message } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          type: 'result',
          aggregate: false,
          file: 'csv',
          combinedColumns: 'Company Name,Column Name',
          order: 'desc',
          sortByAttribute: 'Location Name',
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;
    const { file } = MessageAttributes;
    const { StringValue } = file;

    expect(StringValue).toContain('"type":"result"');
    expect(StringValue).toContain('"aggregate":false');
    expect(StringValue).toContain('"file":"csv"');
    expect(StringValue).toContain('"combinedColumns":"Company Name,Column Name"');
    expect(StringValue).toContain('"order":"desc"');
    expect(StringValue).toContain('"sortByAttribute":"Location Name"');
    expect(StringValue).toContain('"key":');
  });

  it('Should group listId, listFilterStr, listView, selectedLocations inside list', () => {
    const { message } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          listFilterStr: 'text',
          selectedLocations: '1,2,3,4,5',
          listView: 'forest_change',
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;
    const { list } = MessageAttributes;
    const { StringValue } = list;

    expect(StringValue).toContain('"listId":2073');
    expect(StringValue).toContain('"listFilterStr":"text"');
    expect(StringValue).toContain('"selectedLocations":"1,2,3,4,5"');
    expect(StringValue).toContain('"listView":"forest_change"');
  });

  it('Check if user_email and organization_database are passed thought SQS', () => {
    const { message } = buildSQSMessage(
      {
        params: {
          id: 2073,
        },
        query: {
          listFilterStr: 'text',
        },
        session: {
          user_email: 'teste@wri.com',
          organization_database: 'clientdev-co',
        },
      },
      'csv'
    );

    const { MessageAttributes } = message;
    const { userEmail, organizationDatabase } = MessageAttributes;
    console.log(MessageAttributes);
    expect(userEmail.StringValue).toContain('teste@wri.com');
    expect(organizationDatabase.StringValue).toContain('clientdev-co');
  });
});
