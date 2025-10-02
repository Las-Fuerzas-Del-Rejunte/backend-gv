import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface ProductRecord {
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
export class ProductsSupabaseAdapter implements SupabaseAdapter<ProductRecord, Product, CreateProductDto, UpdateProductDto> {
  toDomain(record: ProductRecord): Product {
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

  toRecord(payload: Partial<CreateProductDto | UpdateProductDto>): Partial<ProductRecord> {
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
