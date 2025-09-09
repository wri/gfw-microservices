import { AbstractHandler, RequestNewList } from './types';
import { Logger } from '@nestjs/common';
import { ChainType } from './types';

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

  test('should handle errors in the chain and continue', async () => {
    const request: ChainType = {
      request: {
        list_id: 1,
        organization_database: 'test_db',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
        path: '/test/path', // Added required fields
      },
      geojson: { type: 'FeatureCollection', features: [] },
    };
    const errorMessage = 'Test error';

    // Create a handler that throws an error
    class ErrorHandler extends AbstractHandler<unknown> {
      public async handle(): Promise<unknown> {
        throw new Error(errorMessage);
      }
    }

    const errorHandler = new ErrorHandler();
    const nextHandler = new ConcreteHandler();
    errorHandler.setNext(nextHandler);

    // Mock the updateListsUploadStatus function
    const updateSpy = jest
      .spyOn(AbstractHandler, 'updateListsUploadStatus')
      .mockResolvedValue(undefined);

    // Mock Logger.error
    const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

    // Spy and mock to return request
    jest.spyOn(nextHandler, 'handle').mockImplementation(async () => request);

    const result = await AbstractHandler.runFullChain(errorHandler, request);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error in ErrorHandler: Error: ${errorMessage}`)
    );
    expect(updateSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Error in ErrorHandler'),
      errorMessage
    );
    expect((result as any).request.hasUnanalyzableError).toBe(true); // Corrected path
    // Check if chain continued to next handler
    expect(nextHandler.handle).toHaveBeenCalled();
  });

  test('should handle status code 400 errors without continuing the chain', async () => {
    const request: ChainType = {
      request: {
        list_id: 1,
        organization_database: 'test_db',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
        path: '/test/path', // Added required fields
      },
      geojson: { type: 'FeatureCollection', features: [] },
    };

    // Create a handler that throws a 400 error
    class BadRequestHandler extends AbstractHandler<unknown> {
      public async handle(): Promise<unknown> {
        const error = new Error('Bad request');
        (error as unknown as { status: number }).status = 400;
        throw error;
      }
    }

    const badRequestHandler = new BadRequestHandler();

    await expect(AbstractHandler.runFullChain(badRequestHandler, request)).rejects.toThrow(
      'Bad request'
    );
  });

  test('should handle errors without stack', async () => {
    const request: ChainType = {
      request: {
        list_id: 1,
        organization_database: 'test_db',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
        path: '/test/path', // Added required fields
      },
      geojson: { type: 'FeatureCollection', features: [] },
    };
    const errorMessage = 'Test error without stack';

    class ErrorNoStackHandler extends AbstractHandler<unknown> {
      public async handle(): Promise<unknown> {
        throw { message: errorMessage }; // Error without stack
      }
    }

    const errorNoStackHandler = new ErrorNoStackHandler();

    const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

    await AbstractHandler.runFullChain(errorNoStackHandler, request);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error in ErrorNoStackHandler: ${errorMessage}`)
    );
  });

  test('should break chain execution when preview mode error occurs', async () => {
    const request: ChainType = {
      request: {
        list_id: 1,
        organization_database: 'test_db',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
        path: '/test/path',
        preview: true, // Enable preview mode
      },
      geojson: { type: 'FeatureCollection', features: [] },
    };
    const errorMessage = 'Preview error';

    class PreviewErrorHandler extends AbstractHandler<unknown> {
      public async handle(): Promise<unknown> {
        throw new Error(errorMessage);
      }
    }

    class SecondHandler extends AbstractHandler<unknown> {
      public async handle(request: unknown): Promise<unknown> {
        return super.handle(request);
      }
    }

    const previewErrorHandler = new PreviewErrorHandler();
    const secondHandler = new SecondHandler();
    previewErrorHandler.setNext(secondHandler);

    // Mock the updateListsUploadStatus function
    const updateSpy = jest
      .spyOn(AbstractHandler, 'updateListsUploadStatus')
      .mockResolvedValue(undefined);

    // Mock Logger.error
    const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(jest.fn());

    // Spy on second handler to ensure it's not called
    const secondHandlerSpy = jest.spyOn(secondHandler, 'handle');

    const { request: resultRequest, geojson } = (await AbstractHandler.runFullChain(
      previewErrorHandler,
      request
    )) as ChainType;

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error in PreviewErrorHandler: Error: ${errorMessage}`)
    );
    expect(updateSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('Error in PreviewErrorHandler'),
      errorMessage
    );

    expect((resultRequest as RequestNewList).hasUnanalyzableError).toBe(true);
    // Ensure second handler was not called due to break in preview mode
    expect(secondHandlerSpy).not.toHaveBeenCalled();
    // Ensure the error feature was added to geojson
    expect(geojson.features).toHaveLength(1);
    expect(geojson.features[0].properties.errorDetails).toBe(errorMessage);
  });
});
