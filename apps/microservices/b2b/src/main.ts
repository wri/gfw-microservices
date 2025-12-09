import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import * as http from 'http';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port = process.env.PORT || 3334;

  const config = new DocumentBuilder()
    .setTitle('B2B API')
    .setDescription('B2B API V 1.0')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configure HTTP Keep-Alive for better performance
  const server: http.Server = app.getHttpServer();
  server.keepAliveTimeout = 30000; // 30 seconds keep-alive timeout
  server.headersTimeout = 31000; // 31 seconds headers timeout (should be slightly more than keepAliveTimeout)

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
