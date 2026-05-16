import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.stdout.write('BOOT START\n');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  process.stdout.write('BOOT OK PORT ' + port + '\n');
}

bootstrap().catch(e => {
  process.stdout.write('BOOT ERROR: ' + e.message + '\n');
  process.stdout.write(e.stack + '\n');
  process.exit(1);
});
