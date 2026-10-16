import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tienda API')
    .setDescription('API de productos, clientes y pedidos')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`API escuchando en http://localhost:${port}`);
  console.log(`Documentación en http://localhost:${port}/api/docs`);
}
bootstrap();
