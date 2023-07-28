import { InjectionToken, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
const moduleMocker = new ModuleMocker(global);

type FunctionLike<T> = (token: InjectionToken) => T;

//ensures that only one of the properties (token or condition) can be set at a time.
export type HandlerParam =
  | {
      token: InjectionToken;
      condition?: never;
      callback: FunctionLike<unknown>;
    }
  | {
      token?: never;
      condition: FunctionLike<boolean>;
      callback: FunctionLike<unknown>;
    };

class Handler {
  private nextHandler: Handler | null = null;
  constructor(
    private readonly condition: FunctionLike<boolean>,
    private readonly callbackToken: FunctionLike<unknown>
  ) {}

  public setNextHandler(handler: Handler): void {
    if (this.nextHandler) {
      handler.setNextHandler(this.nextHandler);
    }
    this.nextHandler = handler;
  }

  public handleRequest(token: InjectionToken): unknown {
    if (this.condition(token)) {
      return this.callbackToken(token);
    } else if (this.nextHandler) {
      return this.nextHandler.handleRequest(token);
    }
  }

  protected handle(token: InjectionToken): unknown {
    if (this.condition(token)) return this.callbackToken(token);
  }
}

class HandlerFactory {
  private topHandler: Handler | null = null;

  public createHandler(
    condition: FunctionLike<boolean>,
    callbackToken: FunctionLike<unknown>
  ): Handler {
    const handler = new Handler(condition, callbackToken);
    handler.setNextHandler(this.topHandler);
    this.topHandler = handler;
    return handler;
  }

  public getTopHandler(): Handler | null {
    return this.topHandler;
  }
}

/**
 * Creates a mock module for unit testing.
 * @param options - The options of the module to be mocked.
 * @param handlers - The handlers that define custom behavior for certain tokens or conditions.
 * @returns The created mock module for unit testing.
 */
export const createMockModule = (options: ModuleMetadata, handlers: HandlerParam[] = []) => {
  const factory = new HandlerFactory();
  factory.createHandler(
    (token) => typeof token === 'function',
    (token) => {
      const mockMetadata = moduleMocker.getMetadata(
        token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as MockFunctionMetadata<any, any>;
      const Mock = moduleMocker.generateFromMetadata(mockMetadata);
      return new Mock();
    }
  );

  handlers.forEach((handler) => {
    if (handler.token) factory.createHandler((token) => handler.token === token, handler.callback);
    else factory.createHandler(handler.condition, handler.callback);
  });

  const topHandler = factory.getTopHandler();

  return Test.createTestingModule(options).useMocker((token) => {
    return topHandler.handleRequest(token);
  });
};
