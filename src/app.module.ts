import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './main/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './main/product/product.module';
import { UserModule } from './main/user/user.module';
import { SeedModule } from './common/seed/seed.module';
import { OrderModule } from './main/order/order.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SeedModule,
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
