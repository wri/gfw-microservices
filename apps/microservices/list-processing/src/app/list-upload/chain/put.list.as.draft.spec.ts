import { PutListAsDraft } from './put.list.as.draft';
import { ChainType, RequestNewList } from './types';

describe('PutListAsDraft', () => {
  let handler: PutListAsDraft;

  beforeEach(() => {
    handler = new PutListAsDraft();
  });

  it('should return input if saveAsDraft is true', async () => {
    const input: ChainType = {
      request: { saveAsDraft: true } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [100, 0],
            },
            properties: {},
          },
        ],
      },
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
  });

  it('should return input with saveAsDraft set to true if invalid coordinates are present', async () => {
    const input: ChainType = {
      request: { saveAsDraft: false } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [100, 0],
            },
            properties: {
              errorDetails: ['Invalid coordinates'],
            },
          },
        ],
      },
    };

    const result = await handler.handle(input);
    expect((result.request as RequestNewList).saveAsDraft).toBe(true);
  });

  it('should return input with saveAsDraft set to true if invalid polygon geometry is present', async () => {
    const input: ChainType = {
      request: { saveAsDraft: false } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [100, 0],
            },
            properties: {
              errorDetails: ['Invalid polygon geometry'],
            },
          },
        ],
      },
    };

    const result = await handler.handle(input);
    expect((result.request as RequestNewList).saveAsDraft).toBe(true);
  });

  it('should return input unchanged if no errors are present', async () => {
    const input: ChainType = {
      request: { saveAsDraft: false } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [100, 0],
            },
            properties: {
              errorDetails: [],
            },
          },
        ],
      },
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
  });
});
