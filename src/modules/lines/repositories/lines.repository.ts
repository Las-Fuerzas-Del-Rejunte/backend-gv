import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseCrudRepository } from '../../../common/repositories/supabase-crud.repository';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateLineDto } from '../dto/create-line.dto';
import { UpdateLineDto } from '../dto/update-line.dto';
import { Line } from '../entities/line.entity';
import { LinesSupabaseAdapter, LineRecord } from './lines.supabase-adapter';

@Injectable()
export class LinesRepository extends SupabaseCrudRepository<
  LineRecord,
  Line,
  CreateLineDto,
  UpdateLineDto
> {
  protected readonly tableName = 'lines';
  protected readonly collectionName = 'lines';
  protected readonly adapter: LinesSupabaseAdapter;
  protected readonly orderBy = {
    column: 'created_at',
    ascending: false,
  } as const;
  protected readonly selectColumns = '*, brand:brands(id, name)';

  constructor(supabase: SupabaseService, adapter: LinesSupabaseAdapter) {
    super(supabase);
    this.adapter = adapter;
  }

  async findByBrandAndName(
    brandId: string,
    name: string,
  ): Promise<Line | null> {
    const response = await this.supabase.client
      .from(this.tableName)
      .select(this.selectColumns)
      .eq('brand_id', brandId)
      .eq('name', name)
      .maybeSingle();

    if (response.error && response.error.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Could not verify line uniqueness: ${response.error.message}`,
      );
    }

    if (!response.data) {
      return null;
    }

    const record = response.data as unknown as LineRecord;
    return this.adapter.toDomain(record);
  }
}
