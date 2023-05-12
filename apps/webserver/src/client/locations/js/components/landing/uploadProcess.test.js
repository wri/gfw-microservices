import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import uploadProcess from './uploadProcess';

const uploadS3Mock = (param) => {
  return new Promise((resolve) => {
    resolve(param);
  });
};

describe('upload-process', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  test('create a LLP list', async () => {
    mock
      .onPost('/locations/create-presigned-url', {
        key: 'input_cocoageneric_random_10_r25.csv',
        contentType: 'text/csv',
      })
      .reply(200, {
        url: 'https://gfwpro-lpl-dev.s3.amazonaws.com/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv?AWSAccessKeyId=AKIAY7KBJ32RFTDIH3JD&Content-Type=text%2Fcsv&Expires=1675693490&Signature=nNFvlRp36e7u7ydKFJfsudNriR8%3D',
        keyFile: '4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
        fileS3Route: 's3://gfwpro-lpl-dev/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
      });

    mock
      .onPost('/locations/create-large-list', {
        listName: 'llp gfw pro 205806022023',
      })
      .reply(200, {
        user_id: 10033,
        list_id: 5384,
      });

    mock
      .onPost('/locations/save-list-to-process', {
        list_id: 5384,
        key: '4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
        listName: 'llp gfw pro 205806022023',
      })
      .reply(200, {
        list_id: 5384,
        fileS3Route: 's3://gfwpro-lpl-dev/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
      });

    mock
      .onPost('/locations/process-list', {
        list_id: 5384,
        path: 's3://gfwpro-lpl-dev/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
        template_type: 'cocoa_generic',
        startAnalysis: true,
        listName: 'llp gfw pro 205806022023',
      })
      .reply(200, {
        ResponseMetadata: {
          RequestId: '5d468330-f25c-4fa0-8cf4-29dac8fc3d65',
        },
        MessageId: '01000186292b41a0-9cc6cc9c-4d78-4723-94f5-9663c19122ea-000000',
      });

    const result = await uploadProcess(
      {
        listName: 'llp gfw pro 205806022023',
      },
      uploadS3Mock,
      {
        name: 'input_cocoageneric_random_10_r25.csv',
        type: 'text/csv',
      },
      false
    );

    expect(mock.history.post.length).toEqual(4);
    expect(mock.history.post[0].url).toEqual('/locations/create-presigned-url');
    expect(mock.history.post[1].url).toEqual('/locations/create-large-list');
    expect(mock.history.post[2].url).toEqual('/locations/save-list-to-process');
    expect(mock.history.post[3].url).toEqual('/locations/process-list');

    const { MessageId, listName, list_id: listID } = result;
    expect(MessageId).toEqual('01000186292b41a0-9cc6cc9c-4d78-4723-94f5-9663c19122ea-000000');
    expect(listName).toEqual('llp gfw pro 205806022023');
    expect(listID).toEqual(5384);
  });

  test('Append a LLP list', async () => {
    mock
      .onPost('/locations/create-presigned-url', {
        key: 'input_cocoageneric_random_10_r25.csv',
        contentType: 'text/csv',
      })
      .reply(200, {
        url: 'https://gfwpro-lpl-dev.s3.amazonaws.com/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv?AWSAccessKeyId=AKIAY7KBJ32RFTDIH3JD&Content-Type=text%2Fcsv&Expires=1675693490&Signature=nNFvlRp36e7u7ydKFJfsudNriR8%3D',
        keyFile: '4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
        fileS3Route: 's3://gfwpro-lpl-dev/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
      });

    mock
      .onPost('/locations/process-list', {
        list_id: 5384,
        path: 's3://gfwpro-lpl-dev/4j6l9gkvvldsuhug7-input_cocoageneric_random_10.csv',
        template_type: 'cocoa_generic',
        startAnalysis: true,
        listName: 'llp gfw pro 205806022023',
      })
      .reply(200, {
        ResponseMetadata: {
          RequestId: '5d468330-f25c-4fa0-8cf4-29dac8fc3d65',
        },
        MessageId: '01000186292b41a0-9cc6cc9c-4d78-4723-94f5-9663c19122ea-000000',
      });

    const result = await uploadProcess(
      {
        list_name: 'llp gfw pro 205806022023',
        id: 5384,
      },
      uploadS3Mock,
      {
        name: 'input_cocoageneric_random_10_r25.csv',
        type: 'text/csv',
      },
      true
    );

    const reqList = mock.history.post.map((req) => req.url);
    expect(reqList.length).toEqual(2);
    expect(reqList[0]).toEqual('/locations/create-presigned-url');
    expect(reqList[1]).toEqual('/locations/process-list');
    expect(reqList).not.toContain('/locations/save-list-to-process');
    expect(reqList).not.toContain('/locations/create-large-list');

    const { MessageId, listName, list_id: listID } = result;
    expect(MessageId).toEqual('01000186292b41a0-9cc6cc9c-4d78-4723-94f5-9663c19122ea-000000');
    expect(listName).toEqual('llp gfw pro 205806022023');
    expect(listID).toEqual(5384);
  });
});
