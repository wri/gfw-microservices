import { logExecutionTime } from './shared';
import { performance } from 'perf_hooks';
import { Logger } from '@nestjs/common';

jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(),
  },
}));

describe('logExecutionTime', () => {
  let loggerLogSpy;

  beforeEach(() => {
    loggerLogSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(jest.fn());
    (performance.now as jest.Mock).mockClear();
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
  });

  it('should log the execution time of an async method using NestJS Logger', async () => {
    // Mock performance.now to simulate execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(2000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 1.00s');
  });

  it('should handle negative execution time gracefully using NestJS Logger', async () => {
    // Mock performance.now to simulate negative execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(2000) // start time
      .mockReturnValueOnce(1000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('executed in'));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      'Error: Negative execution time detected for TestClass.testMethod'
    );
  });

  it('should log the execution time of 100ms using NestJS Logger', async () => {
    // Mock performance.now to simulate 100ms execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(1100); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 100.00ms');
  });

  it('should log the execution time of 1 minute using NestJS Logger', async () => {
    // Mock performance.now to simulate 1 minute execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(61000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 1.00min');
  });
});
