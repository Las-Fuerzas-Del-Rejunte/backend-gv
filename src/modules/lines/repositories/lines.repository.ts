import { Injectable } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateLineDto } from '../dto/create-line.dto';
import { UpdateLineDto } from '../dto/update-line.dto';
import { Line } from '../entities/line.entity';
import { LinesSupabaseAdapter, LineRecord } from './lines.supabase-adapter';

@Injectable()
export class LinesRepository extends SupabaseCrudRepository<LineRecord, Line, CreateLineDto, UpdateLineDto> {
  protected readonly tableName = 'lines';
  protected readonly collectionName = 'lines';
  protected readonly adapter: LinesSupabaseAdapter;
  protected readonly orderBy = { column: 'created_at', ascending: false } as const;

  constructor(
    supabase: SupabaseService,
    adapter: LinesSupabaseAdapter,
  ) {
    super(supabase);
    this.adapter = adapter;
  }
}
