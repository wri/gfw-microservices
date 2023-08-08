/*
 * These tests and disabled and the imports are commented out until we can update the Jest
 * configurations to handle ESM imports/exports properly.
 * See JIRA card: GPV-2059
 * https://gfw.atlassian.net/browse/GPV-2059
 */
// import IdentifyTask from 'esri/tasks/IdentifyTask';
// import IdentifyParameters from 'esri/tasks/support/IdentifyParameters';
// import { identifyPoints } from '../../../js/utils/LayerUtils';

const mockAndDontCareAboutResponse = jest.fn(() => Promise.resolve('dummy response'));

/*
jest.mock('esri/tasks/IdentifyTask', () => {
  return function () {
    return { execute: mockAndDontCareAboutResponse };
  };
});
*/

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
