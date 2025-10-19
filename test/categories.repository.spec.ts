import { CategoriesRepository } from '../src/modules/categories/repositories/categories.repository';
import { CategoriesSupabaseAdapter } from '../src/modules/categories/repositories/categories.supabase-adapter';
import { SupabaseService } from '../src/database/supabase.service';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let supabase: SupabaseService;
  let adapter: CategoriesSupabaseAdapter;

  beforeEach(() => {
    supabase = { client: {} } as any;
    adapter = new CategoriesSupabaseAdapter();
    repository = new CategoriesRepository(supabase, adapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository['tableName']).toBe('categories');
    expect(repository['collectionName']).toBe('categories');
    expect(repository['adapter']).toBeInstanceOf(CategoriesSupabaseAdapter);
  });
});
