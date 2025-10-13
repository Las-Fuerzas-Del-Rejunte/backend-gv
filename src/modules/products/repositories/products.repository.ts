import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import {
  ProductsSupabaseAdapter,
  ProductRecord,
} from './products.supabase-adapter';

@Injectable()
export class ProductsRepository extends SupabaseCrudRepository<
  ProductRecord,
  Product,
  CreateProductDto,
  UpdateProductDto
> {
  protected readonly tableName = 'products';
  protected readonly collectionName = 'products';
  protected readonly adapter: ProductsSupabaseAdapter;
  protected readonly orderBy = {
    column: 'created_at',
    ascending: false,
  } as const;
  protected readonly selectColumns =
    '*, category:categories ( id, name, description, created_at, updated_at ), client:clients ( id, first_name, last_name, email, phone, created_at, updated_at )';

  constructor(supabase: SupabaseService, adapter: ProductsSupabaseAdapter) {
    super(supabase);
    this.adapter = adapter;
  }

  async findLowStock(): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(
      (product) => product.stockQuantity <= product.minStock,
    );
  }
}
