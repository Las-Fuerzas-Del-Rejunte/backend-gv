import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategoriesSupabaseAdapter } from './repositories/categories.supabase-adapter';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoriesRepository,
    CategoriesSupabaseAdapter,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
