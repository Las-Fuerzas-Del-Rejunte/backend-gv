import { SupabaseService } from '../src/database/supabase.service';

describe('SupabaseService', () => {
  it('should be defined', () => {
    const service = new SupabaseService({} as any);
    expect(service).toBeDefined();
  });

  it('should return the client', () => {
    const fakeClient = { foo: 'bar' };
    const service = new SupabaseService(fakeClient as any);
    expect(service.client).toBe(fakeClient);
  });
});
