import { InjectionToken, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
const moduleMocker = new ModuleMocker(global);

export const createMockModule = (
  options: ModuleMetadata,
  handlerToken: (token: InjectionToken) => void = null
) => {
  return Test.createTestingModule({ ...options }).useMocker((token) => {
    handlerToken && handlerToken(token);
    if (typeof token === 'function') {
      const mockMetadata = moduleMocker.getMetadata(
        token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as MockFunctionMetadata<any, any>;
      const Mock = moduleMocker.generateFromMetadata(mockMetadata);
      return new Mock();
    }
  });
};
