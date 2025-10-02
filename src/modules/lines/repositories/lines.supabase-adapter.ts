import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Line } from '../entities/line.entity';
import { CreateLineDto } from '../dto/create-line.dto';
import { UpdateLineDto } from '../dto/update-line.dto';

export interface LineRecord {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class LinesSupabaseAdapter implements SupabaseAdapter<LineRecord, Line, CreateLineDto, UpdateLineDto> {
  toDomain(record: LineRecord): Line {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  toRecord(payload: Partial<CreateLineDto | UpdateLineDto>): Partial<LineRecord> {
    const record: Partial<LineRecord> = {};

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.description !== undefined) {
      record.description = payload.description;
    }

    return record;
  }
}
