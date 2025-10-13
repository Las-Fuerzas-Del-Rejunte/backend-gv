import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductsSupabaseAdapter } from './repositories/products.supabase-adapter';
import { BrandsModule } from '../brands/brands.module';
import { LinesModule } from '../lines/lines.module';
import { CategoriesModule } from '../categories/categories.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [BrandsModule, LinesModule, CategoriesModule, ClientsModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsSupabaseAdapter],
  exports: [ProductsService],
})
export class ProductsModule {}
