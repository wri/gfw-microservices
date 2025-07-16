import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { traceContext } from './trace.context';

/**
 * Enhanced console logger for CloudWatch compatibility with trace ID support.
 * Automatically configures itself based on environment without external configuration.
 */
export class ConsoleLog extends ConsoleLogger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    super();
    // Disable colors for non-development environments to improve CloudWatch readability
    if (!this.isDevelopment) {
      process.env.NO_COLOR = '1';
    }
  }

  /**
   * Remove ANSI color codes from a string
   */
  private stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
  }

  /**
   * Format timestamp in ISO format for better CloudWatch parsing
   */
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create structured log format for CloudWatch
   */
  private createStructuredLog(
    level: LogLevel,
    message: unknown,
    context: string,
    traceId?: string
  ): string {
    if (this.isDevelopment) {
      // Use readable format for development
      const timestamp = this.formatTimestamp();
      const tracePrefix = traceId ? `[traceId:${traceId}] ` : '';
      const contextStr = context ? `[${context}] ` : '';
      return `${timestamp} [${level.toUpperCase()}] ${contextStr}${tracePrefix}${message}`;
    } else {
      // Use JSON format for non-development (CloudWatch)
      const logEntry = {
        timestamp: this.formatTimestamp(),
        level: level.toUpperCase(),
        context: context || 'Application',
        message: String(message),
        pid: process.pid,
        ...(traceId && { traceId }),
      };
      return JSON.stringify(logEntry);
    }
  }

  /**
   * Check if colors should be disabled
   */
  private shouldStripColors(): boolean {
    return !this.isDevelopment || !process.stdout.isTTY || process.env.NO_COLOR === '1';
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeStreamType?: 'stdout' | 'stderr'
  ) {
    messages.forEach((message) => {
      const traceId = traceContext.getTraceId();

      let formattedMessage: string;

      if (!this.isDevelopment) {
        // For non-development, use structured logging
        formattedMessage = this.createStructuredLog(logLevel, message, context, traceId);
      } else {
        // For development, use NestJS default but handle colors intelligently
        const pidMessage = this.formatPid(process.pid);
        const contextMessage = this.formatContext(context);
        const timestampDiff = this.updateAndGetTimestampDiff();
        const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');

        const tracePrefix = traceId ? `[traceId:${traceId}] ` : '';
        const enhancedMessage = `${tracePrefix}${message}`;

        formattedMessage = this.formatMessage(
          logLevel,
          enhancedMessage,
          pidMessage,
          formattedLogLevel,
          contextMessage,
          timestampDiff
        );

        // Strip ANSI codes if colors should be disabled
        if (this.shouldStripColors()) {
          formattedMessage = this.stripAnsiCodes(formattedMessage);
        }
      }

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
