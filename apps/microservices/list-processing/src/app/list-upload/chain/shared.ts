import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';

export function logExecutionTime(className) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    const logger = new Logger(className);

    descriptor.value = async function (...args) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const durationMs = end - start;

      // Check for negative duration
      if (durationMs < 0) {
        logger.debug(`Error: Negative execution time detected for ${className}.${propertyKey}`);
        return result;
      }

      // Convert duration to seconds and minutes if needed
      let durationStr;
      if (durationMs < 1000) {
        durationStr = `${durationMs.toFixed(2)}ms`;
      } else if (durationMs < 60000) {
        const durationSec = durationMs / 1000;
        durationStr = `${durationSec.toFixed(2)}s`;
      } else {
        const durationMin = durationMs / 60000;
        durationStr = `${durationMin.toFixed(2)}min`;
      }

      logger.debug(`${className}.${propertyKey} executed in ${durationStr}`);
      return result;
    };

    return descriptor;
  };
}

export async function yieldIfLong(
  lastYieldTimestamp: number,
  options: { thresholdMs?: number; delayMs?: number } = {}
): Promise<number> {
  const { thresholdMs = 1000, delayMs = 100 } = options;
  const now = Date.now();

  if (now - lastYieldTimestamp > thresholdMs) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return Date.now();
  }

  return lastYieldTimestamp;
}
