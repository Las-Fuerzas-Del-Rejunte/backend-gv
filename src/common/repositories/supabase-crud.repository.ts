import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { SupabaseAdapter } from '../adapters/supabase-adapter';

interface OrderConfig {
  column: string;
  ascending?: boolean;
}

export abstract class SupabaseCrudRepository<
  RecordType,
  DomainType,
  CreateDto,
  UpdateDto,
> {
  protected abstract readonly tableName: string;
  protected abstract readonly collectionName: string;
  protected abstract readonly adapter: SupabaseAdapter<
    RecordType,
    DomainType,
    CreateDto,
    UpdateDto
  >;
  protected readonly selectColumns: string = '*';
  protected readonly orderBy?: OrderConfig;

  protected constructor(protected readonly supabase: SupabaseService) {}

  async findAll(): Promise<DomainType[]> {
    const query = this.supabase.client
      .from(this.tableName)
      .select(this.selectColumns);

    if (this.orderBy) {
      query.order(this.orderBy.column, {
        ascending: this.orderBy.ascending ?? false,
      });
    }

    const response = await query;

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch ${this.collectionName}: ${response.error.message}`,
      );
    }

    const records = ((response.data ?? []) as RecordType[]).map((record) =>
      this.adapter.toDomain(record),
    );

    return records;
  }

  async findById(id: string): Promise<DomainType> {
    const response = await this.supabase.client
      .from(this.tableName)
      .select(this.selectColumns)
      .eq('id', id)
      .maybeSingle();

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch ${this.entityName}: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new NotFoundException(
        `${this.entityTitle} with id ${id} not found`,
      );
    }

    return this.adapter.toDomain(response.data as RecordType);
  }

  async create(payload: CreateDto): Promise<DomainType> {
    const record = this.adapter.toRecord(payload);
    const response = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select(this.selectColumns)
      .single();

    if (response.error || !response.data) {
      throw new InternalServerErrorException(
        `Could not create ${this.entityName}: ${response.error?.message}`,
      );
    }

    return this.adapter.toDomain(response.data as RecordType);
  }

  async update(id: string, payload: UpdateDto): Promise<DomainType> {
    const record = this.adapter.toRecord(payload);
    const response = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select(this.selectColumns)
      .maybeSingle();

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not update ${this.entityName}: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new NotFoundException(
        `${this.entityTitle} with id ${id} not found`,
      );
    }

    return this.adapter.toDomain(response.data as RecordType);
  }

  async remove(id: string): Promise<void> {
    const response = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not delete ${this.entityName}: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new NotFoundException(
        `${this.entityTitle} with id ${id} not found`,
      );
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
