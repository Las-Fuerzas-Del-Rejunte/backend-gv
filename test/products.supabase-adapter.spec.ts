import { ProductsSupabaseAdapter, ProductRecord } from '../src/modules/products/repositories/products.supabase-adapter';
import { Product } from '../src/modules/products/entities/product.entity';

describe('ProductsSupabaseAdapter', () => {
  let adapter: ProductsSupabaseAdapter;

  beforeEach(() => {
    adapter = new ProductsSupabaseAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('toDomain convierte ProductRecord a Product', () => {
    const record: ProductRecord = {
      id: '1',
      user_id: 'u1',
      brand_id: 'b1',
      line_id: 'l1',
      category_id: 'c1',
      client_id: 'cl1',
      name: 'Prod1',
      description: 'desc',
      price: 100,
      image: null,
      stock_quantity: 5,
      min_stock: 2,
      created_at: '2025-10-19',
      updated_at: '2025-10-19',
      category: { id: 'c1', name: 'Cat1', description: 'desc', created_at: '2025-10-19', updated_at: '2025-10-19' },
      client: { id: 'cl1', first_name: 'John', last_name: 'Doe', email: 'john@doe.com', phone: '123', created_at: '2025-10-19', updated_at: '2025-10-19' },
    };
    const product: Product = adapter.toDomain(record);
    expect(product).toMatchObject({
      id: '1',
      userId: 'u1',
      brandId: 'b1',
      lineId: 'l1',
      categoryId: 'c1',
      clientId: 'cl1',
      name: 'Prod1',
      description: 'desc',
      price: 100,
      stockQuantity: 5,
      minStock: 2,
      createdAt: '2025-10-19',
      updatedAt: '2025-10-19',
    });
  });

  it('toRecord convierte payload a ProductRecord parcial', () => {
    const payload = { userId: 'u1', brandId: 'b1', lineId: 'l1', name: 'Prod1', price: 100, stockQuantity: 5, minStock: 2 };
    const record = adapter.toRecord(payload);
    expect(record).toMatchObject({ user_id: 'u1', brand_id: 'b1', line_id: 'l1', name: 'Prod1', price: 100, stock_quantity: 5, min_stock: 2 });
  });
});
