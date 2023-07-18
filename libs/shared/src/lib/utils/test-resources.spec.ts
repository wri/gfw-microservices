import { createMockModule, HandlerParam } from './tests-resources';
import { Injectable } from '@nestjs/common';

// Ejemplo de clase de servicio inyectable

@Injectable()
class WorldService {
  say(): string {
    return 'World';
  }
}

@Injectable()
class HelloService {
  say(): string {
    return 'Hello';
  }
}
@Injectable()
class GreetingService {
  constructor(
    private readonly worldService: WorldService,
    private readonly helloService: HelloService
  ) {}
  greet(): string {
    return this.helloService.say() + ' ' + this.worldService.say();
  }
}

describe('createMockModule', () => {
  it('should create a mock module using both styles of handlers', async () => {
    const options = {
      providers: [GreetingService],
    };

    const handlers: HandlerParam[] = [
      {
        condition: (token) => token === HelloService,
        callback: () => ({ say: jest.fn().mockReturnValue('Mocked Hello') }),
      },
      {
        token: WorldService,
        callback: () => ({ say: jest.fn().mockReturnValue('Mocked World') }),
      },
    ];

    const moduleMock = await createMockModule(options, handlers).compile();
    const moduleMocked = moduleMock.get<GreetingService>(GreetingService);

    expect(moduleMocked.greet()).toBe('Mocked Hello Mocked World');
  });

  it('should create a mock module only with composed condition handler', async () => {
    const options = {
      providers: [GreetingService],
    };

    const handlers: HandlerParam[] = [
      {
        condition: (token) => token === HelloService || token === WorldService,
        callback: () => ({ say: jest.fn().mockReturnValue('Mocked') }),
      },
    ];

    const moduleMock = await createMockModule(options, handlers).compile();

    const moduleMocked = moduleMock.get<GreetingService>(GreetingService);
    expect(moduleMocked.greet()).toBe('Mocked Mocked');
  });
});
