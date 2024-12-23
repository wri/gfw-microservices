import { ConvertCommodityToMapsPamCode } from './convert.commodity.mapspam';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';
import { ChainType, RequestNewList } from './types';

describe('ConvertCommodityToMapsPamCode', () => {
  let handler: ConvertCommodityToMapsPamCode;

  beforeEach(() => {
    handler = new ConvertCommodityToMapsPamCode();
  });

  it('should return the same request if commodity is "Other"', async () => {
    const request: ChainType = {
      request: {
        commodity: 'Other',
      } as RequestNewList,
    };

    const result = await handler.handle(request);

    expect(result).toEqual(request);
  });

  it('should map commodity to COMMODITY_MAP_SPAM value if exists', async () => {
    const request: ChainType = {
      request: {
        commodity: 'Banana',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['banana'];

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe(expectedCommodity);
  });

  it('should format commodity if not found in COMMODITY_MAP_SPAM', async () => {
    const request: ChainType = {
      request: {
        commodity: 'Unknown Commodity',
      } as RequestNewList,
    };

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe('"GFWP_"Unknown_Commodity');
  });

  it('should handle commodity with leading/trailing spaces', async () => {
    const request: ChainType = {
      request: {
        commodity: '  Banana  ',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['banana'];

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe(expectedCommodity);
  });

  it('should handle commodity with mixed case', async () => {
    const request: ChainType = {
      request: {
        commodity: 'BaNana',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['banana'];

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe(expectedCommodity);
  });
});
