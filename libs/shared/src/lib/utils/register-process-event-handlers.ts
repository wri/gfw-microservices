import { LoggerService } from '@nestjs/common';

type ProcessLogger = Pick<LoggerService, 'log' | 'error'>;

export interface RegisterProcessEventHandlersOptions {
  serviceName?: string;
}

const formatError = (value: unknown): string => {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const registeredServices = new Set<string>();

const log = (logger: ProcessLogger, message: string, context: string) => {
  logger.log(message, context);
};

const logError = (logger: ProcessLogger, message: string, context: string) => {
  logger.error(message, undefined, context);
};

export const registerProcessEventHandlers = (
  logger: ProcessLogger,
  { serviceName = 'Application' }: RegisterProcessEventHandlersOptions = {}
): void => {
  log(logger, `Starting ${serviceName}`, serviceName);

  if (registeredServices.has(serviceName)) {
    return;
  }
  registeredServices.add(serviceName);

  process.on('SIGINT', () => {
    log(logger, `Stopping ${serviceName} due to SIGINT`, serviceName);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log(logger, `Stopping ${serviceName} due to SIGTERM`, serviceName);
    process.exit(0);
  });

  process.on('uncaughtException', (err: unknown) => {
    logError(logger, `Uncaught Exception in ${serviceName}: ${formatError(err)}`, serviceName);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logError(
      logger,
      `Unhandled Rejection in ${serviceName}: ${formatError(reason)} (promise: ${String(promise)})`,
      serviceName
    );
    process.exit(1);
  });

  process.on('exit', (code: number) => {
    log(logger, `${serviceName} exiting with code ${code}`, serviceName);
  });
};
