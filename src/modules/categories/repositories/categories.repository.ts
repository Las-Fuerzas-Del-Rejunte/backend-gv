import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import {
  CategoriesSupabaseAdapter,
  CategoryRecord,
} from './categories.supabase-adapter';

@Injectable()
export class CategoriesRepository extends SupabaseCrudRepository<
  CategoryRecord,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  protected readonly tableName = 'categories';
  protected readonly collectionName = 'categories';
  protected readonly adapter: CategoriesSupabaseAdapter;
  protected readonly orderBy = {
    column: 'created_at',
    ascending: false,
  } as const;

  constructor(supabase: SupabaseService, adapter: CategoriesSupabaseAdapter) {
    super(supabase);
    this.adapter = adapter;
  }
}
