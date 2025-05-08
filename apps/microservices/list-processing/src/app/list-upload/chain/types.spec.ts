import { AbstractHandler } from './types'; // Adjust the import path as necessary

jest.mock('./types', () => ({
  ...jest.requireActual('./types'),
  updateListsUploadStatus: jest.fn(),
}));

// Create a concrete subclass for testing
class ConcreteHandler extends AbstractHandler<unknown> {
  public async handle(request: unknown): Promise<unknown> {
    // Add custom logic if needed, or just call the superclass method
    return super.handle(request);
  }
}

describe('AbstractHandler', () => {
  let handler1: ConcreteHandler;
  let handler2: ConcreteHandler;
  let handler3: ConcreteHandler;

  beforeEach(() => {
    handler1 = new ConcreteHandler();
    handler2 = new ConcreteHandler();
    handler3 = new ConcreteHandler();
  });

  test('should set the next handler correctly', () => {
    handler1.setNext(handler2);
    handler2.setNext(handler3);

    expect(handler1['nextHandler']).toBe(handler2);
    expect(handler2['nextHandler']).toBe(handler3);
  });

  test('should handle request by passing it through the chain', async () => {
    const request = { data: 'test' };
    const spy1 = jest.spyOn(handler1, 'handle');
    const spy2 = jest.spyOn(handler2, 'handle');
    const spy3 = jest.spyOn(handler3, 'handle');

    handler1.setNext(handler2).setNext(handler3);
    await handler1.handle(request);

    expect(spy1).toHaveBeenCalledWith(request);
    expect(spy2).toHaveBeenCalledWith(request);
    expect(spy3).toHaveBeenCalledWith(request);
  });

  test('should run the full chain and return the final result', async () => {
    const request = {
      request: {
        listId: 1,
      },
    };
    handler1.setNext(handler2).setNext(handler3);

    const result = await AbstractHandler.runFullChain(handler1, request);
    expect(result).toEqual(request);
  });
});
