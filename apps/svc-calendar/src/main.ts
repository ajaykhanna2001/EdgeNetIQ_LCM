import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadServiceConfig } from '@edgenetiq/shared-config';

async function bootstrap() {
  const config = loadServiceConfig('svc-calendar');
  
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // CORS
  app.enableCors(config.cors);

  // Swagger API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EdgeNetIQ Calendar Service')
    .setDescription('Calendar and event management service for EdgeNetIQ platform')
    .setVersion('1.0')
    .addTag('calendar')
    .addTag('events')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port, config.host);
  console.log(`Calendar service is running on: http://${config.host}:${config.port}`);
  console.log(`API documentation available at: http://${config.host}:${config.port}/api`);
}

bootstrap();