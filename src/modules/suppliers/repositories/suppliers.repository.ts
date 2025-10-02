import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { Supplier } from '../entities/supplier.entity';
import { SuppliersSupabaseAdapter, SupplierRecord } from './suppliers.supabase-adapter';

@Injectable()
export class SuppliersRepository extends SupabaseCrudRepository<SupplierRecord, Supplier, CreateSupplierDto, UpdateSupplierDto> {
  protected readonly tableName = 'suppliers';
  protected readonly collectionName = 'suppliers';
  protected readonly adapter: SuppliersSupabaseAdapter;
  protected readonly orderBy = { column: 'created_at', ascending: false } as const;

  constructor(
    supabase: SupabaseService,
    adapter: SuppliersSupabaseAdapter,
  ) {
    super(supabase);
    this.adapter = adapter;
  }
}
