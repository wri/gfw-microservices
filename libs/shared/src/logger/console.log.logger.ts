import { ConsoleLogger, LogLevel } from '@nestjs/common';
/**
 * This module enables to AWS receive the logs and display in one
 * single row.
 */
export class ConsoleLog extends ConsoleLogger {
  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeStreamType?: 'stdout' | 'stderr'
  ) {
    messages.forEach((message) => {
      const pidMessage = this.formatPid(process.pid);
      const contextMessage = this.formatContext(context);
      const timestampDiff = this.updateAndGetTimestampDiff();
      const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');
      const formattedMessage = this.formatMessage(
        logLevel,
        message,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff
      );

      if (logLevel === 'error') {
        console.error(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    });
  }
}
