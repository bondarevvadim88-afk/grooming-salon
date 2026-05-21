import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  console.log('BOOT START');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: '*' });

  // Отдавать статические файлы из папки public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log('BOOT OK PORT ' + port);
}

bootstrap().catch(err => {
  console.error('BOOT ERROR:', err);
  process.exit(1);
});
