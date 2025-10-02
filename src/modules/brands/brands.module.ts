import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './repositories/brands.repository';
import { BrandsSupabaseAdapter } from './repositories/brands.supabase-adapter';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository, BrandsSupabaseAdapter],
  exports: [BrandsService],
})
export class BrandsModule {}
