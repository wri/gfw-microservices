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

  it('should return the same request if commodity is "Unknown"', async () => {
    const request: ChainType = {
      request: {
        commodity: 'Unknown',
      } as RequestNewList,
    };

    const result = await handler.handle(request);

    expect(result).toEqual(request);
  });

  it('should return the same request if commodity is already a MapSpam name', async () => {
    const request: ChainType = {
      request: {
        commodity: 'COCO',
      } as RequestNewList,
    };

    const result = await handler.handle(request);

    expect(result).toEqual(request);
  });

  it('should map commodity to COMMODITY_MAP_SPAM value if exists', async () => {
    const request: ChainType = {
      request: {
        commodity: 'Cocoa generic',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['cocoa'];

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

    expect((result.request as RequestNewList).commodity).toBe('GFWP_Unknown_Commodity');
  });

  it('should handle commodity with leading/trailing spaces', async () => {
    const request: ChainType = {
      request: {
        commodity: '  cocoa  ',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['cocoa'];

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe(expectedCommodity);
  });

  it('should handle commodity with mixed case', async () => {
    const request: ChainType = {
      request: {
        commodity: 'CoCoa',
      } as RequestNewList,
    };

    const expectedCommodity = COMMODITY_MAP_SPAM['cocoa generic'];

    const result = await handler.handle(request);

    expect((result.request as RequestNewList).commodity).toBe(expectedCommodity);
  });
});
