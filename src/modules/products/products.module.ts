import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductsSupabaseAdapter } from './repositories/products.supabase-adapter';
import { BrandsModule } from '../brands/brands.module';
import { LinesModule } from '../lines/lines.module';
import { ProductSuppliersRepository } from './repositories/product-suppliers.repository';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [BrandsModule, LinesModule, SuppliersModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductsSupabaseAdapter,
    ProductSuppliersRepository,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
