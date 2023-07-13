import { createMockModule, HandlerParam } from './tests-resources';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

// Ejemplo de clase de servicio inyectable
@Injectable()
class HelloService {
  sayHello(): string {
    return 'Hello';
  }
}

@Injectable()
class WorldService {
  sayWorld(): string {
    return 'Hello';
  }
}

describe('createMockModule', () => {
  it('should create a mock module with handlers', async () => {
    const options = {
      providers: [HelloService, WorldService],
    };

    const handlers: HandlerParam[] = [
      {
        condition: (token) => token === HelloService,
        callback: () => {
          console.log('entre');
          return { sayHello: jest.fn().mockReturnValue('Mocked Hello') };
        },
      },
      {
        token: WorldService,
        callback: () => ({ sayWorld: jest.fn().mockReturnValue('Mocked World') }),
      },
    ];

    const moduleMock = await createMockModule(options, handlers).compile();

    const moduleWithoutMock = await Test.createTestingModule({
      ...options,
    }).compile();

    const helloMocked = moduleMock.get<HelloService>(HelloService);
    const helloNoMocked = moduleWithoutMock.get<HelloService>(HelloService);

    const worldMocked = moduleMock.get(WorldService);
    const worldNoMocked = moduleWithoutMock.get(WorldService);

    console.log(helloMocked.sayHello());

    expect(helloNoMocked.sayHello()).toBe('Hello');
    expect(helloMocked.sayHello()).toBe('Mocked Hello');
    expect(worldNoMocked.sayWorld()).toBe('World');
    expect(worldMocked.sayWorld()).toBe('Mocked World');
  });
});
