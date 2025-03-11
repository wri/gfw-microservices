import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from './validators/server-config';

const SWAGGER_DISABLED_ENVS = ['staging', 'production'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get<ConfigService<ServerConfigType, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });

  if (!SWAGGER_DISABLED_ENVS.includes(config.get('NODE_ENV', { infer: true }))) {
    Logger.log('Swagger enabled');
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
