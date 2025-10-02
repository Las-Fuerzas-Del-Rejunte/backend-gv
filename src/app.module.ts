import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './database/supabase.module';
import { BrandsModule } from './modules/brands/brands.module';
import { LinesModule } from './modules/lines/lines.module';
import { ProductsModule } from './modules/products/products.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { SalesModule } from './modules/sales/sales.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { SupabaseRoleGuard } from './common/guards/supabase-role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    BrandsModule,
    LinesModule,
    ProductsModule,
    SuppliersModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SupabaseRoleGuard,
    },
  ],
})
export class AppModule {}
