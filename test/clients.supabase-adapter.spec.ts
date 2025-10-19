import { ClientsSupabaseAdapter, ClientRecord } from '../src/modules/clients/repositories/clients.supabase-adapter';
import { Client } from '../src/modules/clients/entities/client.entity';

describe('ClientsSupabaseAdapter', () => {
  let adapter: ClientsSupabaseAdapter;

  beforeEach(() => {
    adapter = new ClientsSupabaseAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('toDomain convierte ClientRecord a Client', () => {
    const record: ClientRecord = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      phone: '123',
      created_at: '2025-10-19',
      updated_at: '2025-10-19',
    };
    const client: Client = adapter.toDomain(record);
    expect(client).toEqual({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      phone: '123',
      createdAt: '2025-10-19',
      updatedAt: '2025-10-19',
    });
  });

  it('toRecord convierte payload a ClientRecord parcial', () => {
    const payload = { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', phone: '123' };
    const record = adapter.toRecord(payload);
    expect(record).toEqual({ first_name: 'John', last_name: 'Doe', email: 'john@doe.com', phone: '123' });
  });
});
