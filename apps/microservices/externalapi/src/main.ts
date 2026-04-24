/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as http from 'http';
import { AppModule } from './app/app.module';
import { SecurityHeaderMiddleware } from './middleware/security-header.middleware';
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
  bootstrapLogger.setContext('ExternalApiBootstrap');
  registerProcessEventHandlers(bootstrapLogger, { serviceName: 'External API' });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: bootstrapLogger,
    bufferLogs: true, // Buffer logs until custom logger is initialized to prevent early messages from using default logger
  });
  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(new SecurityHeaderMiddleware().use);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  const swaggerServer: { url: string; description: string } = (() => {
    switch (nodeEnv) {
      case 'ProdV2':
        return { url: 'https://pro.globalforestwatch.org', description: 'Production' };
      case 'staging':
        return { url: 'https://pro-staging.globalforestwatch.org', description: 'Staging' };
      case 'qa':
        return { url: 'https://pro-qa.globalforestwatch.org', description: 'QA' };
      default:
        return { url: `http://localhost:${port}`, description: 'Local' };
    }
  })();

  const configSwagger = new DocumentBuilder()
    .setTitle('GFW Pro API')
    .setDescription('V1 for GFW Pro API')
    .setVersion('1.0')
    .addServer(swaggerServer.url, swaggerServer.description)
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key'
    )
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: '/api/profile',
  });

  // Configure HTTP Keep-Alive for better performance
  const server: http.Server = app.getHttpServer();
  server.keepAliveTimeout = 30000; // 30 seconds keep-alive timeout
  server.headersTimeout = 31000; // 31 seconds headers timeout (should be slightly more than keepAliveTimeout)

  await app.listen(port);
  bootstrapLogger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    'External API'
  );

  // To prevent issues in the future, I want to add a test to ensure that the necessary variables are set in the environment and are not null or undefined.
  // This is a good practice to follow in general, but it is especially important when working with microservices.
  // If you forget to set an environment variable, you will not get an error until you try to use it. This can be very frustrating to debug, so it is best to catch these issues early.
}

bootstrap();
