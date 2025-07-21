import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: env.FRONTEND_URL,
      credentials: true,
    });

    app.setGlobalPrefix('api');

    await app.listen(3001);
  } catch (error) {
    console.error('Error starting application:', error);
  }
}

bootstrap();
