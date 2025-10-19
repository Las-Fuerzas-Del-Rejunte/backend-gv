import { LinesSupabaseAdapter, LineRecord } from '../src/modules/lines/repositories/lines.supabase-adapter';
import { Line } from '../src/modules/lines/entities/line.entity';

describe('LinesSupabaseAdapter', () => {
  let adapter: LinesSupabaseAdapter;

  beforeEach(() => {
    adapter = new LinesSupabaseAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('toDomain convierte LineRecord a Line', () => {
    const record: LineRecord = {
      id: '1',
      brand_id: 'b1',
      name: 'Linea1',
      description: 'desc',
      created_at: '2025-10-19',
      updated_at: '2025-10-19',
      brand: { id: 'b1', name: 'Brand1' },
    };
    const line: Line = adapter.toDomain(record);
    expect(line).toEqual({
      id: '1',
      brandId: 'b1',
      name: 'Linea1',
      description: 'desc',
      createdAt: '2025-10-19',
      updatedAt: '2025-10-19',
      brand: { id: 'b1', name: 'Brand1' },
    });
  });

  it('toRecord convierte payload a LineRecord parcial', () => {
    const payload = { brandId: 'b1', name: 'Linea1', description: 'desc' };
    const record = adapter.toRecord(payload);
    expect(record).toEqual({ brand_id: 'b1', name: 'Linea1', description: 'desc' });
  });
});
