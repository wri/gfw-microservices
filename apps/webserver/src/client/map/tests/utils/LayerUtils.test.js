import {queryAdmin} from '../../js/utils/LayerUtils';

const mockExecute = jest.fn(() => Promise.resolve({
  features: [{
    geometry: "geometry",
    attributes: {
      iso: "US",
      name_0: "United States"
    }
  }]
}));

jest.mock('esri/tasks/QueryTask', () => {
  return jest.fn().mockImplementation(() => {
    return {execute: mockExecute};
  });
});

beforeEach(() => {
  mockExecute.mockClear();
});

describe('LayerUtils#queryAdmin', () => {
  describe('QueryTask#execute Integration', () => {
    describe('When `serverLayerId` is greater than 5', () => {
      it('contains only `iso` and `name_0` outFields', async () => {
        const result = await queryAdmin({gadmid: "ABW", serverLayerId: 6});
        const expected = {
          outFields: [
            'iso',
            'name_0',
          ],
        }
        const queryObject = {...mockExecute.mock.calls[0][0]};
        expect(queryObject).toMatchObject(expected);
      });
      it('query includes the `gadmid`', async () => {
        const result = await queryAdmin({gadmid: "ABW", serverLayerId: 6});
        const expected = {
          where: "gadmid = 'ABW'",
        }
        const queryObject = {...mockExecute.mock.calls[0][0]};
        expect(queryObject).toMatchObject(expected);
      });
    });
  });
  describe('Success', () => {
    describe('When the ArcGIS QueryTask returns features', () => {
      it('resolves with geometry, country and region data', async () => {
        const result = await queryAdmin({gadmid: "gadmid", serverLayerId: 6});
        expect(result).toStrictEqual({
          country: "US",
          countryText: "United States",
          geometry: "geometry",
          region: "",
          stateText: "",
          substateText: ""
        });
      });
    });
  });
});
