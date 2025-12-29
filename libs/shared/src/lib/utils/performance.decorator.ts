import { performance } from 'perf_hooks';

export function Performance() {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = performance.now();
      const initialMemoryUsage = process.memoryUsage().heapUsed;
      const initialCpuUsage = process.cpuUsage();

      const result = await originalMethod.apply(this, args);

      const endTime = performance.now();
      const finalMemoryUsage = process.memoryUsage().heapUsed;
      const finalCpuUsage = process.cpuUsage(initialCpuUsage);

      console.log(`Execution Time: ${((endTime - startTime) / 1000).toFixed(3)} seconds`);
      console.log(
        `Memory Usage: ${((finalMemoryUsage - initialMemoryUsage) / (1024 * 1024)).toFixed(2)} MB`
      );
      console.log(
        `CPU Usage - User: ${finalCpuUsage.user / 1000000} s, System: ${
          finalCpuUsage.system / 1000000
        } s`
      );

      return result;
    };

    return descriptor;
  };
}
