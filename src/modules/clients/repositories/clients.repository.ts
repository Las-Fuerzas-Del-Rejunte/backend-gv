import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client } from '../entities/client.entity';
import {
  ClientsSupabaseAdapter,
  ClientRecord,
} from './clients.supabase-adapter';

@Injectable()
export class ClientsRepository extends SupabaseCrudRepository<
  ClientRecord,
  Client,
  CreateClientDto,
  UpdateClientDto
> {
  protected readonly tableName = 'clients';
  protected readonly collectionName = 'clients';
  protected readonly adapter: ClientsSupabaseAdapter;
  protected readonly orderBy = {
    column: 'created_at',
    ascending: false,
  } as const;

  constructor(supabase: SupabaseService, adapter: ClientsSupabaseAdapter) {
    super(supabase);
    this.adapter = adapter;
  }
}
