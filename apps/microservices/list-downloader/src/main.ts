import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 add this

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';
import { ConsoleLog, initializeGlobalAxiosTracing } from '@wri-monorepos/shared';

async function bootstrap() {
  // Initialize global axios tracing before creating the app
  initializeGlobalAxiosTracing();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLog(),
    bufferLogs: true, // Buffer logs until custom logger is initialized to prevent early messages from using default logger
  });

  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
