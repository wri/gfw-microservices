/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { SecurityHeaderMiddleware } from './middleware/security-header.middleware';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
const SWAGGER_DISABLED_ENVS: ReadonlyArray<string> = ['staging', 'production'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(new SecurityHeaderMiddleware().use);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  if (!SWAGGER_DISABLED_ENVS.includes(config.get('NODE_ENV', { infer: true }))) {
    const config = new DocumentBuilder()
      .setTitle('External API')
      .setDescription('V1 for external API')
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

    const jsonDocumentPath = path
      .join(__dirname, 'swagger-doc', 'document.json')
      .replace('/dist', '');
    const document = SwaggerModule.createDocument(app, config);
    try {
      const oldSwaggerDoc = JSON.parse(fs.readFileSync(jsonDocumentPath, 'utf8'));

      const hashOlsSwaggerDoc = createHash('md5')
        .update(JSON.stringify(oldSwaggerDoc))
        .digest('hex');
      const hash = createHash('md5').update(JSON.stringify(document)).digest('hex');

      if (hashOlsSwaggerDoc !== hash) {
        await fs.writeFileSync(jsonDocumentPath, JSON.stringify(document, null, 2));
      }
    } catch (error) {
      await fs.writeFileSync(jsonDocumentPath, JSON.stringify(document, null, 2));
    }
    SwaggerModule.setup('api', app, document, {
      jsonDocumentUrl: '/api/profile',
    });
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);

  // To prevent issues in the future, I want to add a test to ensure that the necessary variables are set in the environment and are not null or undefined.
  // This is a good practice to follow in general, but it is especially important when working with microservices.
  // If you forget to set an environment variable, you will not get an error until you try to use it. This can be very frustrating to debug, so it is best to catch these issues early.
}

bootstrap();
