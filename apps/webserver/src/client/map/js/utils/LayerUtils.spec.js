import QueryTask from '@arcgis/tasks/QueryTask';
import { queryAdmin, queryExtent, identifyPoints } from './LayerUtils';

describe.skip('LayerUtils#queryAdmin', () => {
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
      await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
      const expected = {
        where: "gadmid = 'ABW'",
      };
      const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(queryObject).toMatchObject(expected);
    });
    describe('When `serverLayerId` is greater than 5', () => {
      it('query contains only `iso` and `name_0` outFields', async () => {
        await queryAdmin({ gadmid: 'ABW', serverLayerId: 6 });
        const expected = {
          outFields: ['iso', 'name_0'],
        };
        const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` is 5', () => {
      it('adds `name_1` and `id_1` to the outFields in the query', async () => {
        await queryAdmin({ gadmid: 'ABW', serverLayerId: 5 });
        const expected = {
          outFields: ['iso', 'name_0', 'name_1', 'id_1'],
        };
        const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
        expect(queryObject).toMatchObject(expected);
      });
    });
    describe('When `serverLayerId` less than 5', () => {
      it('adds `name_2`, `name_1`, and `id_1` to the outFields in the query', async () => {
        await queryAdmin({ gadmid: 'ABW', serverLayerId: 4 });
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
        jest.spyOn(console, 'log').mockImplementation(jest.fn()); // silence the console output in queryAdmin
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

describe.skip('LayerUtils#queryExtent', () => {
  describe('Integration: QueryTask#executeForExtent', () => {
    const mockAndDontCareAboutResponse = jest.fn(() => Promise.resolve());
    beforeAll(() => {
      QueryTask.mockImplementation(() => {
        return { executeForExtent: mockAndDontCareAboutResponse };
      });
    });
    beforeEach(() => {
      mockAndDontCareAboutResponse.mockClear();
    });
    it("uses a default query if one isn't passed as an argument", async () => {
      await queryExtent('https://example.com');
      const expected = { where: '1=1' };
      const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(queryObject).toMatchObject(expected);
    });
    it('uses the provided query if one is passed as an argument', async () => {
      await queryExtent('https://example.com', 'myQuery=42');
      const expected = { where: 'myQuery=42' };
      const queryObject = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(queryObject).toMatchObject(expected);
    });
  });
  describe('Integration: Extent#expand', () => {
    describe('Success', () => {
      describe('When the ArcGIS QueryTask returns an extent', () => {
        const mockExpand = jest.fn();
        const mockAndReturnAnExtent = jest.fn(() =>
          Promise.resolve({
            extent: { expand: mockExpand },
          })
        );
        beforeAll(() => {
          QueryTask.mockImplementation(() => {
            return { executeForExtent: mockAndReturnAnExtent };
          });
        });
        beforeEach(() => {
          mockExpand.mockClear();
          mockAndReturnAnExtent.mockClear();
        });
        it('expands the extent by 20%', async () => {
          await queryExtent('https://example.com');
          expect(mockExpand.mock.calls[0][0]).toBe(1.2);
        });
      });
    });
  });
  describe('Success', () => {
    describe('When the ArcGIS QueryTask returns an extent', () => {
      const dummyExtent = { name: 'DummyExtent' };
      const stubExpand = jest.fn(() => dummyExtent);
      const stubAndReturnAnExtent = jest.fn(() =>
        Promise.resolve({
          extent: { expand: stubExpand },
        })
      );
      beforeAll(() => {
        QueryTask.mockImplementation(() => {
          return { executeForExtent: stubAndReturnAnExtent };
        });
      });
      it('returns the Extent object', async () => {
        const result = await queryExtent('https://example.com');
        expect(result).toEqual(dummyExtent);
      });
    });
    describe('When the ArcGIS QueryTask does NOT return an extent', () => {
      const stubNoExtentReturned = jest.fn(() => Promise.resolve({}));
      beforeAll(() => {
        QueryTask.mockImplementation(() => {
          return { executeForExtent: stubNoExtentReturned };
        });
      });
      it('resolves to `false`', async () => {
        const result = await queryExtent('https://example.com');
        expect(result).toBe(false);
      });
    });
  });
  describe('Failure', () => {
    describe('When the ArcGIS QueryTask throws an error', () => {
      const stubAndReject = jest.fn(() => Promise.reject(new Error('Something went wrong')));
      beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        QueryTask.mockImplementation(() => {
          return { executeForExtent: stubAndReject };
        });
      });
      it('resolves to `false`', async () => {
        const result = await queryExtent('https://example.com');
        expect(result).toBe(false);
      });
    });
  });
});

const mockAndDontCareAboutResponse = jest.fn(() => Promise.resolve('dummy response'));

describe.skip('LayerUtils#identifyTask', () => {
  describe('Integration: IdentifyTask#execute', () => {
    beforeEach(() => {
      mockAndDontCareAboutResponse.mockClear();
    });
    it('sends an empty array of layer IDs if there are NO visible layers', async () => {
      await identifyPoints({ url: 'https://layer.example.com' }, { mapPoint: 'point' }, {});
      const identifyParams = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(identifyParams).toMatchObject({ layerIds: [] });
    });
    it('sends an array of layer IDs if there are visible layers', async () => {
      await identifyPoints(
        {
          url: 'https://layer.example.com',
          sublayers: [
            {
              id: 1,
              visible: true,
            },
          ],
        },
        { mapPoint: 'point' },
        {}
      );
      const identifyParams = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(identifyParams).toMatchObject({ layerIds: [1] });
    });
    it('sends unique layer IDs if there are visible layers', async () => {
      await identifyPoints(
        {
          url: 'https://layer.example.com',
          sublayers: [
            {
              id: 1,
              visible: true,
            },
            {
              id: 1,
              visible: true,
            },
            {
              id: 2,
              visible: true,
            },
          ],
        },
        { mapPoint: 'point' },
        {}
      );
      const identifyParams = { ...mockAndDontCareAboutResponse.mock.calls[0][0] };
      expect(identifyParams).toMatchObject({ layerIds: [1, 2] });
    });
  });
  describe('Success', () => {
    it('returns an object with a response and the original layer id', async () => {
      const result = await identifyPoints(
        {
          id: 42,
          url: 'https://layer.example.com',
        },
        { mapPoint: 'point' },
        {}
      );
      expect(result).toMatchObject({
        layer: 42,
        response: 'dummy response',
      });
    });
  });
});
