import { SeedModule } from '@/common/seed/seed.module';
import { NestFactory } from '@nestjs/core';


async function bootstrap() {
  console.log('🚀 Starting admin seeding...');
  
  const app = await NestFactory.createApplicationContext(SeedModule);

  await app.close();
  console.log('✅ Admin seeding finished, exiting.');
}

bootstrap();
