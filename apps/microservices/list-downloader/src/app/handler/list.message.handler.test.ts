import { ListMessageHandler } from './list.message.handler';

describe('reorganizeFilters', () => {
  let listMessageHandler: ListMessageHandler;

  beforeEach(() => {
    listMessageHandler = new ListMessageHandler(undefined);
  });

  test('Should convert array into a string', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { DataType: 'String', StringValue: '{"analysisAreaMin":"0"}' },
        geoInfo: { DataType: 'String', StringValue: '{}' },
        userEmail: { DataType: 'String', StringValue: 'gustavo.figueiredo.5@wriconsultant.org' },
        organizationDatabase: { DataType: 'String', StringValue: 'clientstore-QACO' },
        file: {
          DataType: 'String',
          StringValue:
            '{"aggregate":"true","type":"everything","key":"tmp-20-WhpxMYru54jx","file":"csv","order":"asc"}',
        },
        list: {
          DataType: 'String',
          StringValue:
            '{"listId":"1069","listFilterStr":"","listView":"forest_change","selectedLocations":""}',
        },
        endDate: {
          DataType: 'String',
          StringValue: '09-02-2024',
        },
        type: {
          DataType: 'String',
          StringValue: 'everything',
        },
        key: {
          DataType: 'String',
          StringValue: 'tmp-20-WhpxMYru54jx',
        },
      }),
    });

    expect(result).toEqual({
      aggregate: 'true',
      analysisAreaMin: '0',
      file: 'csv',
      key: 'tmp-20-WhpxMYru54jx',
      listFilterStr: '',
      listId: '1069',
      listView: 'forest_change',
      order: 'asc',
      organizationDatabase: 'clientstore-QACO',
      selectedLocations: '',
      type: 'everything',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
      endDate: '09-02-2024',
    });
  });

  test('When the body of the message is undefined', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: undefined,
    });

    expect(result).toEqual({});
  });

  test('When the body of the message is empty object', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: '{}',
    });

    expect(result).toEqual({});
  });

  test('Should convert array into a string', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { DataType: 'String', StringValue: '' },
        geoInfo: { DataType: 'String', StringValue: '' },
        userEmail: { DataType: 'String', StringValue: '' },
        organizationDatabase: { DataType: 'String', StringValue: '' },
        file: { DataType: 'String', StringValue: '' },
        list: { DataType: 'String', StringValue: '' },
      }),
    });

    expect(result).toEqual({ organizationDatabase: '', userEmail: '' });
  });

  test('Should convert array into a string', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { DataType: 'String', StringValue: '0' },
        geoInfo: { DataType: 'String', StringValue: '0' },
        userEmail: { DataType: 'String', StringValue: '0' },
        organizationDatabase: { DataType: 'String', StringValue: '0' },
        file: { DataType: 'String', StringValue: '0' },
        list: { DataType: 'String', StringValue: '0' },
      }),
    });

    expect(result).toEqual({ organizationDatabase: '0', userEmail: '0' });
  });

  test('Should convert array into a string', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { DataType: 'String', StringValue: '{}' },
        geoInfo: { DataType: 'String', StringValue: '{}' },
        userEmail: { DataType: 'String', StringValue: '0' },
        organizationDatabase: { DataType: 'String', StringValue: '0' },
        file: { DataType: 'String', StringValue: '{}' },
        list: { DataType: 'String', StringValue: '{}' },
      }),
    });

    expect(result).toEqual({ organizationDatabase: '0', userEmail: '0' });
  });

  test('Should convert array into a string', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { DataType: 'String', StringValue: 'undefined' },
        geoInfo: { DataType: 'String', StringValue: 'undefined' },
        userEmail: { DataType: 'String', StringValue: 'undefined' },
        organizationDatabase: { DataType: 'String', StringValue: 'undefined' },
        file: { DataType: 'String', StringValue: 'undefined' },
        list: { DataType: 'String', StringValue: 'undefined' },
      }),
    });

    expect(result).toEqual({ organizationDatabase: '', userEmail: '' });
  });
});
