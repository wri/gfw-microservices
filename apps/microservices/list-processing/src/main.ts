import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as http from 'http';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';
import {
  ConsoleLog,
  initializeGlobalAxiosTracing,
  registerProcessEventHandlers,
} from '@wri-monorepos/shared';

const SWAGGER_DISABLED_ENVS = ['staging', 'production'];

async function bootstrap() {
  // Initialize global axios tracing before creating the app
  initializeGlobalAxiosTracing();

  const bootstrapLogger = new ConsoleLog();
  bootstrapLogger.setContext('ListProcessingBootstrap');
  registerProcessEventHandlers(bootstrapLogger, { serviceName: 'List Processing' });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: bootstrapLogger,
    bufferLogs: true, // Buffer logs until custom logger is initialized to prevent early messages from using default logger
  });
  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  if (!SWAGGER_DISABLED_ENVS.includes(config.get('NODE_ENV', { infer: true }))) {
    bootstrapLogger.log('Swagger enabled', 'List Processing');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('List-Processing API')
      .setDescription('V1 for List-Processing API')
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
        },
        'x-api-key'
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
  // Configure HTTP Keep-Alive for better performance
  const server: http.Server = app.getHttpServer();
  server.keepAliveTimeout = 30000; // 30 seconds keep-alive timeout
  server.headersTimeout = 31000; // 31 seconds headers timeout (should be slightly more than keepAliveTimeout)

  bootstrapLogger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    'List Processing'
  );
  await app.listen(port);
}

bootstrap();
