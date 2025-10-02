import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';

interface BrandRecord {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class BrandsRepository {
  private readonly tableName = 'brands';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Brand[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch brands: ${error.message}`);
    }

    const records = (data ?? []) as BrandRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Brand> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch brand: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return this.toDomain(data as BrandRecord);
  }

  async create(payload: CreateBrandDto): Promise<Brand> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(`Could not create brand: ${error?.message}`);
    }

    return this.toDomain(data as BrandRecord);
  }

  async update(id: string, payload: UpdateBrandDto): Promise<Brand> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not update brand: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return this.toDomain(data as BrandRecord);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not delete brand: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }
  }

  private toDomain(record: BrandRecord): Brand {
    return {
      id: record.id,
      userId: record.user_id,
      name: record.name,
      description: record.description ?? null,
      logo: record.logo ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  private toRecord(payload: Partial<CreateBrandDto | UpdateBrandDto>): Partial<BrandRecord> {
    const record: Partial<BrandRecord> = {};

    if (payload.userId !== undefined) {
      record.user_id = payload.userId;
    }

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.description !== undefined) {
      record.description = payload.description;
    }

    if (payload.logo !== undefined) {
      record.logo = payload.logo;
    }

    return record;
  }
}
