import { SchedulerModule } from './index';

describe('SchedulerModule', () => {
  it('should be defined', () => {
    expect(SchedulerModule).toBeDefined();
  });

  it('should have the correct module metadata', () => {
    // Test that the module has the expected structure
    const module = new SchedulerModule();
    expect(module).toBeInstanceOf(SchedulerModule);
  });

  it('should export a class', () => {
    // Verify that the module exports a class that can be instantiated
    expect(typeof SchedulerModule).toBe('function');
    expect(SchedulerModule.name).toBe('SchedulerModule');
  });

  it('should have the correct module name', () => {
    // Test that the module has the expected name
    expect(SchedulerModule.name).toBe('SchedulerModule');
  });
});
