/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { SecurityHeaderMiddleware } from './middleware/security-header.middleware';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(new SecurityHeaderMiddleware().use);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  const configSwagger = new DocumentBuilder()
    .setTitle('GFW Pro API')
    .setDescription('V1 for GFW Pro API')
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

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: '/api/profile',
  });

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);

  // To prevent issues in the future, I want to add a test to ensure that the necessary variables are set in the environment and are not null or undefined.
  // This is a good practice to follow in general, but it is especially important when working with microservices.
  // If you forget to set an environment variable, you will not get an error until you try to use it. This can be very frustrating to debug, so it is best to catch these issues early.
}

bootstrap();
