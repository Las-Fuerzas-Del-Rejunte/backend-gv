import { ProductsRepository } from '../src/modules/products/repositories/products.repository';
import { ProductsSupabaseAdapter } from '../src/modules/products/repositories/products.supabase-adapter';
import { SupabaseService } from '../src/database/supabase.service';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let supabase: SupabaseService;
  let adapter: ProductsSupabaseAdapter;

  beforeEach(() => {
    supabase = { client: {} } as any;
    adapter = new ProductsSupabaseAdapter();
    repository = new ProductsRepository(supabase, adapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository['tableName']).toBe('products');
    expect(repository['collectionName']).toBe('products');
    expect(repository['adapter']).toBeInstanceOf(ProductsSupabaseAdapter);
  });
});
