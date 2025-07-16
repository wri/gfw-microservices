import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { traceContext } from './trace.context';

/**
 * This module enables AWS to receive the logs and display in one
 * single row. Also includes trace ID for better observability.
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
      const traceId = traceContext.getTraceId();
      const pidMessage = this.formatPid(process.pid);
      const contextMessage = this.formatContext(context);
      const timestampDiff = this.updateAndGetTimestampDiff();
      const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');

      // Include trace ID in the formatted message if available
      const tracePrefix = traceId ? `[traceId:${traceId}] ` : '';

      // Use NestJS's built-in formatMessage but modify the message part
      const enhancedMessage = `${tracePrefix}${message}`;

      const formattedMessage = this.formatMessage(
        logLevel,
        enhancedMessage,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff
      );

      // Convert multi-line to single line by replacing newlines with spaces
      const singleLineMessage = formattedMessage.replace(/\n/g, ' ');

      if (logLevel === 'error') {
        console.error(singleLineMessage);
      } else {
        console.log(singleLineMessage);
      }
    });
  }
}
