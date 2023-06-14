import QueryTask from 'esri/tasks/QueryTask';
import { queryExtent } from '../../../js/utils/LayerUtils';

jest.mock('esri/tasks/QueryTask');

describe('LayerUtils#queryExtent', () => {
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
        jest.spyOn(console, 'log').mockImplementation(() => {}); // silence the console output in queryAdmin
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
