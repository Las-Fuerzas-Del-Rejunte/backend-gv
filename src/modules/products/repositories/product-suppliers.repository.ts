import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateProductSupplierDto } from '../dto/create-product.dto';
import { ProductSupplier } from '../entities/product-supplier.entity';
import { ProductSupplierRecord } from './products.supabase-adapter';

@Injectable()
export class ProductSuppliersRepository {
  private readonly tableName = 'product_suppliers';

  constructor(private readonly supabase: SupabaseService) {}

  async findByProduct(productId: string): Promise<ProductSupplier[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('id, product_id, supplier_id, code, created_at')
      .eq('product_id', productId);

    if (error) {
      throw new InternalServerErrorException(
        `Could not fetch product suppliers: ${error.message}`,
      );
    }

    const records = (data ?? []) as ProductSupplierRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async replaceForProduct(
    productId: string,
    items: CreateProductSupplierDto[],
    previousSuppliers?: ProductSupplier[],
  ): Promise<ProductSupplier[]> {
    const previous = previousSuppliers ?? (await this.findByProduct(productId));

    const { error: deleteError } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Could not reset product suppliers: ${deleteError.message}`,
      );
    }

    if (items.length === 0) {
      return [];
    }

    const payload = items.map((item) => ({
      product_id: productId,
      supplier_id: item.supplierId,
      code: item.code,
    }));

    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(payload)
      .select('id, product_id, supplier_id, code, created_at');

    if (error || !data) {
      await this.restore(previous);
      throw new InternalServerErrorException(
        `Could not link suppliers to product: ${error?.message}`,
      );
    }

    const records = data as ProductSupplierRecord[];
    return records.map((record) => this.toDomain(record));
  }

  private async restore(previous: ProductSupplier[]): Promise<void> {
    if (previous.length === 0) {
      return;
    }

    const payload = previous.map((item) => ({
      product_id: item.productId,
      supplier_id: item.supplierId,
      code: item.code,
    }));

    try {
      await this.supabase.client.from(this.tableName).insert(payload);
    } catch {
      // Ignore restore errors; original failure will be raised to the caller.
    }
  }

  private toDomain(record: ProductSupplierRecord): ProductSupplier {
    return {
      id: record.id,
      productId: record.product_id,
      supplierId: record.supplier_id,
      code: record.code,
      createdAt: record.created_at,
    };
  }
}
