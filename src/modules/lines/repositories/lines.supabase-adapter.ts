import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Line } from '../entities/line.entity';
import { CreateLineDto } from '../dto/create-line.dto';
import { UpdateLineDto } from '../dto/update-line.dto';

export interface BrandRecord {
  id: string;
  name: string;
}

export interface LineRecord {
  id: string;
  brand_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  brand?: BrandRecord;
}

@Injectable()
export class LinesSupabaseAdapter
  implements SupabaseAdapter<LineRecord, Line, CreateLineDto, UpdateLineDto>
{
  toDomain(record: LineRecord): Line {
    return {
      id: record.id,
      brandId: record.brand_id,
      name: record.name,
      description: record.description ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      brand: record.brand
        ? {
            id: record.brand.id,
            name: record.brand.name,
          }
        : undefined,
    };
  }

  toRecord(
    payload: Partial<CreateLineDto | UpdateLineDto>,
  ): Partial<LineRecord> {
    const record: Partial<LineRecord> = {};

    if (payload.brandId !== undefined) {
      record.brand_id = payload.brandId;
    }

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.description !== undefined) {
      record.description = payload.description;
    }

    return record;
  }
}
