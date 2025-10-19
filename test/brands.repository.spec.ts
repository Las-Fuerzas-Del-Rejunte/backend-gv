import { BrandsRepository } from '../src/modules/brands/repositories/brands.repository';
import { BrandsSupabaseAdapter } from '../src/modules/brands/repositories/brands.supabase-adapter';
import { SupabaseService } from '../src/database/supabase.service';

describe('BrandsRepository', () => {
  let repository: BrandsRepository;
  let supabase: SupabaseService;
  let adapter: BrandsSupabaseAdapter;

  beforeEach(() => {
    supabase = { client: {} } as any;
    adapter = new BrandsSupabaseAdapter();
    repository = new BrandsRepository(supabase, adapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository['tableName']).toBe('brands');
    expect(repository['collectionName']).toBe('brands');
    expect(repository['adapter']).toBeInstanceOf(BrandsSupabaseAdapter);
  });
});
