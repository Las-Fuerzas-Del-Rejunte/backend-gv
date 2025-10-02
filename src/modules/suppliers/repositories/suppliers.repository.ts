import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

interface SupplierRecord {
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
export class SuppliersRepository {
  private readonly tableName = 'suppliers';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Supplier[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch suppliers: ${error.message}`);
    }

    const records = (data ?? []) as SupplierRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Supplier> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch supplier: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.toDomain(data as SupplierRecord);
  }

  async create(payload: CreateSupplierDto): Promise<Supplier> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(`Could not create supplier: ${error?.message}`);
    }

    return this.toDomain(data as SupplierRecord);
  }

  async update(id: string, payload: UpdateSupplierDto): Promise<Supplier> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not update supplier: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.toDomain(data as SupplierRecord);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not delete supplier: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
  }

  private toDomain(record: SupplierRecord): Supplier {
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

  private toRecord(payload: Partial<CreateSupplierDto | UpdateSupplierDto>): Partial<SupplierRecord> {
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
