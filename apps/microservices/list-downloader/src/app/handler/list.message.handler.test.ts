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
      aggregation: false,
      analysisAreaMin: 0,
      endDate: '09-02-2024',
      file: 'csv',
      isGFWList: false,
      key: 'tmp-20-WhpxMYru54jx',
      listId: 1069,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-QACO',
      selectedAlert: undefined,
      selectedLocations: '',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      type: 'everything',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });

  test('Should convert diagnostic file message, list is not gfw', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { StringValue: '{"analysisAreaMin":"0"}', DataType: 'String' },
        file: {
          StringValue:
            '{"aggregate":"true","type":"everything","key":"tmp-25749-KT3JHspCfVsn","file":"csv","order":"asc"}',
          DataType: 'String',
        },
        geoInfo: { StringValue: '{}', DataType: 'String' },
        list: {
          StringValue:
            '{"listId":"5837","listFilterStr":"","listView":"forest_change","selectedLocations":"","isGFWList":"false"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      analysisAreaMin: 0,
      endDate: undefined,
      file: 'csv',
      isGFWList: false,
      key: 'tmp-25749-KT3JHspCfVsn',
      listId: 5837,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: undefined,
      selectedLocations: '',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      type: 'everything',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });
  test('Should convert diagnostic file message, list is gfw', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { StringValue: '{"analysisAreaMin":"0"}', DataType: 'String' },
        file: {
          StringValue:
            '{"aggregate":"true","type":"everything","key":"tmp-25749-KT3JHspCfVsn","file":"csv","order":"asc"}',
          DataType: 'String',
        },
        geoInfo: { StringValue: '{}', DataType: 'String' },
        list: {
          StringValue:
            '{"listId":"5837","listFilterStr":"","listView":"forest_change","selectedLocations":"","isGFWList":"true"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      analysisAreaMin: 0,
      endDate: undefined,
      file: 'csv',
      isGFWList: true,
      key: 'tmp-25749-KT3JHspCfVsn',
      listId: 5837,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: undefined,
      selectedLocations: '',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      type: 'everything',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });
  test('Should convert diagnostic southAmericaTcl file', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { StringValue: '{"analysisAreaMin":"0"}', DataType: 'String' },
        file: {
          StringValue:
            '{"aggregate":"true","type":"southAmericaTCL","key":"tmp-25749-hvd9F9SDXvUl","file":"csv","order":"asc"}',
          DataType: 'String',
        },
        geoInfo: { StringValue: '{}', DataType: 'String' },
        list: {
          StringValue:
            '{"listId":"5837","listFilterStr":"","listView":"forest_change","selectedLocations":"","isGFWList":"false"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      analysisAreaMin: 0,
      endDate: undefined,
      file: 'csv',
      isGFWList: false,
      key: 'tmp-25749-hvd9F9SDXvUl',
      listId: 5837,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: undefined,
      selectedLocations: '',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      type: 'southAmericaTCL',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });
  test('Should convert results file message', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { StringValue: '{"analysisAreaMin":"0"}', DataType: 'String' },
        file: {
          StringValue:
            '{"aggregate":"true","type":"results","key":"tmp-25749-SEGL7oIHaYHs","file":"csv","combinedColumns":"State,Country","order":"asc","sortByAttribute":"Investment Name"}',
          DataType: 'String',
        },
        geoInfo: { StringValue: '{}', DataType: 'String' },
        list: {
          StringValue:
            '{"listId":"5837","listFilterStr":"","listView":"forest_change","selectedLocations":"1,2,3,4,5,6","isGFWList":"false"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      analysisAreaMin: 0,
      combinedColumns: 'State,Country',
      endDate: undefined,
      file: 'csv',
      isGFWList: false,
      key: 'tmp-25749-SEGL7oIHaYHs',
      listId: 5837,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: undefined,
      selectedLocations: '1,2,3,4,5,6',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      sortByAttribute: 'Investment Name',
      startDate: undefined,
      type: 'results',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });
  test('Should convert shapefile message', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        analysisArea: { StringValue: '{"analysisAreaMin":"0"}', DataType: 'String' },
        file: {
          StringValue:
            '{"aggregate":"true","type":"input","key":"tmp-25749-z3xhBosZ80zt","file":"shapefile","combinedColumns":"","order":"asc","sortByAttribute":"Investment Name"}',
          DataType: 'String',
        },
        geoInfo: { StringValue: '{}', DataType: 'String' },
        list: {
          StringValue:
            '{"listId":"5837","listFilterStr":"","listView":"forest_change","selectedLocations":"all","isGFWList":"false"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      analysisAreaMin: 0,
      combinedColumns: '',
      endDate: undefined,
      file: 'shapefile',
      isGFWList: false,
      key: 'tmp-25749-z3xhBosZ80zt',
      listId: 5837,
      listView: 'forest_change',
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: undefined,
      selectedLocations: 'all',
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      sortByAttribute: 'Investment Name',
      startDate: undefined,
      type: 'input',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });
  test('Should convert alert message', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: JSON.stringify({
        file: {
          StringValue: '{"type":"alerts","key":"tmp-25749-IMT31EfQl4m2"}',
          DataType: 'String',
        },
        list: {
          StringValue: '{"listId":"5886","isGFWList":"false"}',
          DataType: 'String',
        },
        organizationDatabase: { StringValue: 'clientstore-DevCo', DataType: 'String' },
        selectedAlert: { StringValue: 'Integrated', DataType: 'String' },
        selectedTimeframe: { StringValue: 'WEEK', DataType: 'String' },
        userEmail: {
          StringValue: 'gustavo.figueiredo.5@wriconsultant.org',
          DataType: 'String',
        },
      }),
    });
    expect(result).toEqual({
      aggregation: false,
      endDate: undefined,
      isGFWList: false,
      key: 'tmp-25749-IMT31EfQl4m2',
      listId: 5886,
      organizationDatabase: 'clientstore-DevCo',
      selectedAlert: 'Integrated',
      selectedTimeframe: 'WEEK',
      showRSPOCertified: false,
      startDate: undefined,
      type: 'alerts',
      userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
    });
  });

  test('When the body of the message is undefined', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: undefined,
    });

    expect(result).toEqual({
      aggregation: false,
      endDate: undefined,
      isGFWList: false,
      organizationDatabase: undefined,
      selectedAlert: undefined,
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      userEmail: undefined,
    });
  });

  test('When the body of the message is empty object', () => {
    const result = listMessageHandler.reorganizeFilters({
      Body: '{}',
    });

    expect(result).toEqual({
      aggregation: false,
      endDate: undefined,
      isGFWList: false,
      organizationDatabase: undefined,
      selectedAlert: undefined,
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      userEmail: undefined,
    });
  });

  test('When all the inputs are undefined', () => {
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

    expect(result).toEqual({
      aggregation: false,
      endDate: undefined,
      isGFWList: false,
      organizationDatabase: '',
      selectedAlert: undefined,
      selectedTimeframe: undefined,
      showRSPOCertified: false,
      startDate: undefined,
      userEmail: '',
    });
  });
});
