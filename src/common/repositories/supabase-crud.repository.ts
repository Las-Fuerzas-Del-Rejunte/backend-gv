import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { SupabaseAdapter } from '../adapters/supabase-adapter';

interface OrderConfig {
  column: string;
  ascending?: boolean;
}

export abstract class SupabaseCrudRepository<RecordType, DomainType, CreateDto, UpdateDto> {
  protected abstract readonly tableName: string;
  protected abstract readonly collectionName: string;
  protected abstract readonly adapter: SupabaseAdapter<RecordType, DomainType, CreateDto, UpdateDto>;
  protected readonly selectColumns = '*';
  protected readonly orderBy?: OrderConfig;

  protected constructor(protected readonly supabase: SupabaseService) {}

  async findAll(): Promise<DomainType[]> {
    const query = this.supabase.client
      .from(this.tableName)
      .select(this.selectColumns);

    if (this.orderBy) {
      query.order(this.orderBy.column, { ascending: this.orderBy.ascending ?? false });
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Could not fetch ${this.collectionName}: ${error.message}`);
    }

    const records = (data ?? []) as RecordType[];
    return records.map((record) => this.adapter.toDomain(record));
  }

  async findById(id: string): Promise<DomainType> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select(this.selectColumns)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch ${this.entityName}: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`${this.entityTitle} with id ${id} not found`);
    }

    return this.adapter.toDomain(data as RecordType);
  }

  async create(payload: CreateDto): Promise<DomainType> {
    const record = this.adapter.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select(this.selectColumns)
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(`Could not create ${this.entityName}: ${error?.message}`);
    }

    return this.adapter.toDomain(data as RecordType);
  }

  async update(id: string, payload: UpdateDto): Promise<DomainType> {
    const record = this.adapter.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select(this.selectColumns)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not update ${this.entityName}: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`${this.entityTitle} with id ${id} not found`);
    }

    return this.adapter.toDomain(data as RecordType);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not delete ${this.entityName}: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`${this.entityTitle} with id ${id} not found`);
    }
  }

  private get entityName(): string {
    return this.collectionName.endsWith('s')
      ? this.collectionName.slice(0, -1)
      : this.collectionName;
  }

  private get entityTitle(): string {
    const name = this.entityName;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
