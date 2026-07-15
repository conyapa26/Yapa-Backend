import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://conyapa.cl',
      'https://www.conyapa.cl',
      'https://yapa-frontend.vercel.app',
      'http://localhost:5173'
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
