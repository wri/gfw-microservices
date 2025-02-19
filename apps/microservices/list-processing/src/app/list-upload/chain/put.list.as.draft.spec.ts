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
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
  });

  it('should log an error and return input with saveAsDraft set to true if hasUnanalyzableError is true', async () => {
    const input: ChainType = {
      request: { saveAsDraft: false, hasUnanalyzableError: true } as RequestNewList,
    };

    const loggerSpy = jest.spyOn(handler['logger'], 'error');
    const result = await handler.handle(input);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Should put list as draft, has invalid coordinates or polygon geometry'
    );
    expect(result).toEqual({
      ...input,
      request: { ...input.request, saveAsDraft: true },
    });
  });

  it('should return input unchanged if hasUnanalyzableError is false', async () => {
    const input: ChainType = {
      request: { saveAsDraft: false, hasUnanalyzableError: false } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
  });
});
