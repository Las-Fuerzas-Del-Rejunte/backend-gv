import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

export interface SupplierRecord {
  id: string;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SuppliersSupabaseAdapter implements SupabaseAdapter<SupplierRecord, Supplier, CreateSupplierDto, UpdateSupplierDto> {
  toDomain(record: SupplierRecord): Supplier {
    return {
      id: record.id,
      name: record.name,
      contactPerson: record.contact_person ?? null,
      email: record.email ?? null,
      phone: record.phone ?? null,
      address: record.address ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  toRecord(payload: Partial<CreateSupplierDto | UpdateSupplierDto>): Partial<SupplierRecord> {
    const record: Partial<SupplierRecord> = {};

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.contactPerson !== undefined) {
      record.contact_person = payload.contactPerson;
    }

    if (payload.email !== undefined) {
      record.email = payload.email;
    }

    if (payload.phone !== undefined) {
      record.phone = payload.phone;
    }

    if (payload.address !== undefined) {
      record.address = payload.address;
    }

    return record;
  }
}
