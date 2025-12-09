import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 add this
import * as http from 'http';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';
import {
  ConsoleLog,
  initializeGlobalAxiosTracing,
  registerProcessEventHandlers,
} from '@wri-monorepos/shared';

async function bootstrap() {
  // Initialize global axios tracing before creating the app
  initializeGlobalAxiosTracing();
  const bootstrapLogger = new ConsoleLog();
  bootstrapLogger.setContext('ListDownloaderBootstrap');
  registerProcessEventHandlers(bootstrapLogger, { serviceName: 'List Downloader' });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: bootstrapLogger,
    bufferLogs: true, // Buffer logs until custom logger is initialized to prevent early messages from using default logger
  });

  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  // Configure HTTP Keep-Alive for better performance
  const server: http.Server = app.getHttpServer();
  server.keepAliveTimeout = 30000; // 30 seconds keep-alive timeout
  server.headersTimeout = 31000; // 31 seconds headers timeout (should be slightly more than keepAliveTimeout)

  await app.listen(port);
  bootstrapLogger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    'List Downloader'
  );
}

bootstrap();
