import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { Brand } from '../entities/brand.entity';
import { BrandsSupabaseAdapter, BrandRecord } from './brands.supabase-adapter';

@Injectable()
export class BrandsRepository extends SupabaseCrudRepository<
  BrandRecord,
  Brand,
  CreateBrandDto,
  UpdateBrandDto
> {
  protected readonly tableName = 'brands';
  protected readonly collectionName = 'brands';
  protected readonly adapter: BrandsSupabaseAdapter;
  protected readonly orderBy = {
    column: 'created_at',
    ascending: false,
  } as const;

  constructor(supabase: SupabaseService, adapter: BrandsSupabaseAdapter) {
    super(supabase);
    this.adapter = adapter;
  }
}
