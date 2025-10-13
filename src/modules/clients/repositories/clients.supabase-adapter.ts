import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

export interface ClientRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ClientsSupabaseAdapter
  implements
    SupabaseAdapter<ClientRecord, Client, CreateClientDto, UpdateClientDto>
{
  toDomain(record: ClientRecord): Client {
    return {
      id: record.id,
      firstName: record.first_name,
      lastName: record.last_name,
      email: record.email,
      phone: record.phone ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  toRecord(
    payload: Partial<CreateClientDto | UpdateClientDto>,
  ): Partial<ClientRecord> {
    const record: Partial<ClientRecord> = {};

    if (payload.firstName !== undefined) {
      record.first_name = payload.firstName;
    }

    if (payload.lastName !== undefined) {
      record.last_name = payload.lastName;
    }

    if (payload.email !== undefined) {
      record.email = payload.email;
    }

    if (payload.phone !== undefined) {
      record.phone = payload.phone;
    }

    return record;
  }
}
