import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

interface ProductRecord {
  id: string;
  user_id: string;
  brand_id: string;
  line_id?: string | null;
  name: string;
  description?: string | null;
  category: string;
  price: string | number;
  image?: string | null;
  stock_quantity: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ProductsRepository {
  private readonly tableName = 'products';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch products: ${error.message}`);
    }

    const records = (data ?? []) as ProductRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Product> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch product: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.toDomain(data as ProductRecord);
  }

  async create(payload: CreateProductDto): Promise<Product> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(`Could not create product: ${error?.message}`);
    }

    return this.toDomain(data as ProductRecord);
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not update product: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.toDomain(data as ProductRecord);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not delete product: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  private toDomain(record: ProductRecord): Product {
    return {
      id: record.id,
      userId: record.user_id,
      brandId: record.brand_id,
      lineId: record.line_id ?? null,
      name: record.name,
      description: record.description ?? null,
      category: record.category,
      price: typeof record.price === 'string' ? parseFloat(record.price) : record.price,
      image: record.image ?? null,
      stockQuantity: record.stock_quantity,
      minStock: record.min_stock,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  private toRecord(payload: Partial<CreateProductDto | UpdateProductDto>): Partial<ProductRecord> {
    const record: Partial<ProductRecord> = {};

    if (payload.userId !== undefined) {
      record.user_id = payload.userId;
    }

    if (payload.brandId !== undefined) {
      record.brand_id = payload.brandId;
    }

    if (payload.lineId !== undefined) {
      record.line_id = payload.lineId;
    }

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.description !== undefined) {
      record.description = payload.description;
    }

    if (payload.category !== undefined) {
      record.category = payload.category;
    }

    if (payload.price !== undefined) {
      record.price = payload.price;
    }

    if (payload.image !== undefined) {
      record.image = payload.image;
    }

    if (payload.stockQuantity !== undefined) {
      record.stock_quantity = payload.stockQuantity;
    }

    if (payload.minStock !== undefined) {
      record.min_stock = payload.minStock;
    }

    return record;
  }
}
