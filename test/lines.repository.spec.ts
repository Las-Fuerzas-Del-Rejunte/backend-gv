import { LinesRepository } from '../src/modules/lines/repositories/lines.repository';
import { LinesSupabaseAdapter } from '../src/modules/lines/repositories/lines.supabase-adapter';
import { SupabaseService } from '../src/database/supabase.service';

describe('LinesRepository', () => {
  let repository: LinesRepository;
  let supabase: SupabaseService;
  let adapter: LinesSupabaseAdapter;

  beforeEach(() => {
    supabase = { client: {} } as any;
    adapter = new LinesSupabaseAdapter();
    repository = new LinesRepository(supabase, adapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository['tableName']).toBe('lines');
    expect(repository['collectionName']).toBe('lines');
    expect(repository['adapter']).toBeInstanceOf(LinesSupabaseAdapter);
  });
});
