import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';

export interface BrandRecord {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class BrandsSupabaseAdapter implements SupabaseAdapter<BrandRecord, Brand, CreateBrandDto, UpdateBrandDto> {
  toDomain(record: BrandRecord): Brand {
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

  toRecord(payload: Partial<CreateBrandDto | UpdateBrandDto>): Partial<BrandRecord> {
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
