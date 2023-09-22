/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
const SWAGGER_DISABLED_ENVS = ['staging', 'production'];
const DEFAULT_APP_PORT = 3336;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || DEFAULT_APP_PORT;

  if (!SWAGGER_DISABLED_ENVS.includes(process.env.NODE_ENV)) {
    const config = new DocumentBuilder()
      .setTitle('External API')
      .setDescription('V1 for external API')
      .setVersion('1.0')
      .addTag('v1')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);

  // To prevent issues in the future, I want to add a test to ensure that the necessary variables are set in the environment and are not null or undefined.
  // This is a good practice to follow in general, but it is especially important when working with microservices.
  // If you forget to set an environment variable, you will not get an error until you try to use it. This can be very frustrating to debug, so it is best to catch these issues early.
}

bootstrap();
