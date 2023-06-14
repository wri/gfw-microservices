import { queryAdmin } from '../../js/utils/LayerUtils';

const mockExecute = jest.fn(() =>
  Promise.resolve({
    features: [
      {
        geometry: 'geometry',
        attributes: {
          iso: 'US',
          name_0: 'United States',
        },
      },
    ],
  })
);

jest.mock('esri/tasks/QueryTask', () => {
  return jest.fn().mockImplementation(() => {
    return { execute: mockExecute };
  });
});

beforeEach(() => {
  mockExecute.mockClear();
});

describe('LayerUtils#queryAdmin', () => {
  describe('Integration: QueryTask#execute', () => {
    it('query includes the `gadmid`', async () => {
      const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
      const expected = {
        where: "gadmid = 'ABW'",
      };
      const queryObject = { ...mockExecute.mock.calls[0][0] };
      expect(queryObject).toMatchObject(expected);
    });
    describe('When `serverLayerId` is greater than 5', () => {
      it('query contains only `iso` and `name_0` outFields', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
        const expected = {
          outFields: ['iso', 'name_0'],
        };
        const queryObject = { ...mockExecute.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` is 5', () => {
      it('adds `name_1` and `id_1` to the outFields in the query', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 5 });
        const expected = {
          outFields: ['iso', 'name_0', 'name_1', 'id_1'],
        };
        const queryObject = { ...mockExecute.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` less than 5', () => {
      it('adds `name_2`, `name_1`, and `id_1` to the outFields in the query', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 4 });
        const expected = {
          outFields: ['iso', 'name_0', 'name_1', 'id_1', 'name_2'],
        };
        const queryObject = { ...mockExecute.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
  });
  describe('Success', () => {
    describe('When the ArcGIS QueryTask returns features', () => {
      it('resolves with geometry, country and region data', async () => {
        const result = await queryAdmin({ gadmid: 'gadmid', serverLayerId: 6 });
        expect(result).toStrictEqual({
          country: 'US',
          countryText: 'United States',
          geometry: 'geometry',
          region: '',
          stateText: '',
          substateText: '',
        });
      });
    });
  });
});
