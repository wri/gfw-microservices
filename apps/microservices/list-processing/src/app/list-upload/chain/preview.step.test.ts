import { PreviewStep } from './preview.step';
import { ChainType, PreviewListRequest } from './types';

describe('PreviewStep', () => {
  let previewStep: PreviewStep;

  beforeEach(() => {
    previewStep = new PreviewStep();
  });

  it('should filter the first 10 features of the geojson object', async () => {
    const input: ChainType = {
      request: {} as PreviewListRequest,
      geojson: {
        features: Array.from({ length: 20 }, (_, i) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [i, i],
          },
          properties: {
            name: `feature${i}`,
          },
        })),
        type: 'FeatureCollection',
      },
    };

    const expectedOutput: ChainType = {
      request: {} as PreviewListRequest,
      geojson: {
        features: Array.from({ length: 10 }, (_, i) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [i, i],
          },
          properties: {
            name: `feature${i}`,
          },
        })),
        type: 'FeatureCollection',
      },
    } as ChainType;

    const result = await previewStep.handle(input);

    expect(result.geojson.features).toHaveLength(10);
    expect(result.geojson.features).toEqual(expectedOutput.geojson.features);
  });

  it('should return the request unchanged if geojson or features are not present', async () => {
    const input: ChainType = {
      request: {} as PreviewListRequest,
      geojson: null,
    };

    const result = await previewStep.handle(input);

    expect(result).toEqual(input);
  });
});
