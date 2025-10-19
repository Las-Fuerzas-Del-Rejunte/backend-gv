import { ClientsRepository } from '../src/modules/clients/repositories/clients.repository';
import { ClientsSupabaseAdapter } from '../src/modules/clients/repositories/clients.supabase-adapter';
import { SupabaseService } from '../src/database/supabase.service';

describe('ClientsRepository', () => {
  let repository: ClientsRepository;
  let supabase: SupabaseService;
  let adapter: ClientsSupabaseAdapter;

  beforeEach(() => {
    supabase = { client: {} } as any;
    adapter = new ClientsSupabaseAdapter();
    repository = new ClientsRepository(supabase, adapter);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(repository['tableName']).toBe('clients');
    expect(repository['collectionName']).toBe('clients');
    expect(repository['adapter']).toBeInstanceOf(ClientsSupabaseAdapter);
  });
});
