import { BrandsSupabaseAdapter, BrandRecord } from '../src/modules/brands/repositories/brands.supabase-adapter';
import { Brand } from '../src/modules/brands/entities/brand.entity';

describe('BrandsSupabaseAdapter', () => {
  let adapter: BrandsSupabaseAdapter;

  beforeEach(() => {
    adapter = new BrandsSupabaseAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('toDomain convierte BrandRecord a Brand', () => {
    const record: BrandRecord = {
      id: '1',
      user_id: 'user1',
      name: 'Brand1',
      description: 'desc',
      logo: null,
      created_at: '2025-10-19',
      updated_at: '2025-10-19',
    };
    const brand: Brand = adapter.toDomain(record);
    expect(brand).toEqual({
      id: '1',
      userId: 'user1',
      name: 'Brand1',
      description: 'desc',
      logo: null,
      createdAt: '2025-10-19',
      updatedAt: '2025-10-19',
    });
  });

  it('toRecord convierte payload a BrandRecord parcial', () => {
    const payload = { userId: 'user1', name: 'Brand1', description: 'desc', logo: 'logo.png' };
    const record = adapter.toRecord(payload);
    expect(record).toEqual({ user_id: 'user1', name: 'Brand1', description: 'desc', logo: 'logo.png' });
  });
});
