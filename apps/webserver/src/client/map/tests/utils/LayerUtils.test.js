import QueryTask from 'esri/tasks/QueryTask';
import { queryAdmin } from '../../js/utils/LayerUtils';

jest.mock('esri/tasks/QueryTask');

describe('LayerUtils#queryAdmin', () => {
  describe('Integration: QueryTask#execute', () => {
    const mockAndDontCareAboutResponse = jest.fn(() => Promise.resolve());
    beforeAll(() => {
      QueryTask.mockImplementation(() => {
        return { execute: mockAndDontCareAboutResponse };
      });
    });
    beforeEach(() => {
      mockAndDontCareAboutResponse.mockClear();
    });
    it('query includes the `gadmid`', async () => {
      const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
      const expected = {
        where: "gadmid = 'ABW'",
      };
      const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(queryObject).toMatchObject(expected);
    });
    describe('When `serverLayerId` is greater than 5', () => {
      it('query contains only `iso` and `name_0` outFields', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
        const expected = {
          outFields: ['iso', 'name_0'],
        };
        const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` is 5', () => {
      it('adds `name_1` and `id_1` to the outFields in the query', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 5 });
        const expected = {
          outFields: ['iso', 'name_0', 'name_1', 'id_1'],
        };
        const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` less than 5', () => {
      it('adds `name_2`, `name_1`, and `id_1` to the outFields in the query', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 4 });
        const expected = {
          outFields: ['iso', 'name_0', 'name_1', 'id_1', 'name_2'],
        };
        const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
  });
  describe('Success', () => {
    describe('When the ArcGIS QueryTask returns features', () => {
      beforeAll(() => {
        const stubWithFeaturesInResponse = jest.fn(() =>
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

        QueryTask.mockImplementation(() => {
          return { execute: stubWithFeaturesInResponse };
        });
      });
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
    describe('When the ArcGIS QueryTask does NOT return features', () => {
      beforeAll(() => {
        const stubWithNoFeaturesInResponse = jest.fn(() =>
          Promise.resolve({
            features: [],
          })
        );

        QueryTask.mockImplementation(() => {
          return { execute: stubWithNoFeaturesInResponse };
        });
      });
      it('resolves to `false`', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
        expect(result).toBe(false);
      });
    });
  });
  describe('Failure', () => {
    describe('When the ArcGIS QueryTask throws an error', () => {
      beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {}); // silence the console output in queryAdmin
        const stubThatRejects = jest.fn(() => Promise.reject(new Error('Something went wrong')));

        QueryTask.mockImplementation(() => {
          return { execute: stubThatRejects };
        });
      });
      it('resolves to `false`', async () => {
        const result = await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
        expect(result).toBe(false);
      });
    });
  });
});
