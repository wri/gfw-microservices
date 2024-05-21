/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { ConsoleLog } from '@wri-monorepos/shared';
const SWAGGER_DISABLED_ENVS = ['staging', 'production'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLog() });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;

  // Swagger
  if (!SWAGGER_DISABLED_ENVS.includes(process.env.NODE_ENV)) {
    console.log('Swagger enabled');
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  await app.listen(port);
}

bootstrap();
