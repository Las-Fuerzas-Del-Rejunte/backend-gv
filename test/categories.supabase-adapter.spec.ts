import { CategoriesSupabaseAdapter, CategoryRecord } from '../src/modules/categories/repositories/categories.supabase-adapter';
import { Category } from '../src/modules/categories/entities/category.entity';

describe('CategoriesSupabaseAdapter', () => {
  let adapter: CategoriesSupabaseAdapter;

  beforeEach(() => {
    adapter = new CategoriesSupabaseAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('toDomain convierte CategoryRecord a Category', () => {
    const record: CategoryRecord = {
      id: '1',
      name: 'Cat1',
      description: 'desc',
      created_at: '2025-10-19',
      updated_at: '2025-10-19',
    };
    const category: Category = adapter.toDomain(record);
    expect(category).toEqual({
      id: '1',
      name: 'Cat1',
      description: 'desc',
      createdAt: '2025-10-19',
      updatedAt: '2025-10-19',
    });
  });

  it('toRecord convierte payload a CategoryRecord parcial', () => {
    const payload = { name: 'Cat1', description: 'desc' };
    const record = adapter.toRecord(payload);
    expect(record).toEqual({ name: 'Cat1', description: 'desc' });
  });
});
