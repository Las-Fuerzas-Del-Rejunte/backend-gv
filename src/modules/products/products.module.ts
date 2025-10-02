import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductsSupabaseAdapter } from './repositories/products.supabase-adapter';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsSupabaseAdapter],
  exports: [ProductsService],
})
export class ProductsModule {}
