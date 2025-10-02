import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Line } from '../entities/line.entity';
import { CreateLineDto } from '../dto/create-line.dto';
import { UpdateLineDto } from '../dto/update-line.dto';

interface LineRecord {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class LinesRepository {
  private readonly tableName = 'lines';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Line[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch lines: ${error.message}`);
    }

    const records = (data ?? []) as LineRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Line> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch line: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Line with id ${id} not found`);
    }

    return this.toDomain(data as LineRecord);
  }

  async create(payload: CreateLineDto): Promise<Line> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(record)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(`Could not create line: ${error?.message}`);
    }

    return this.toDomain(data as LineRecord);
  }

  async update(id: string, payload: UpdateLineDto): Promise<Line> {
    const record = this.toRecord(payload);
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .update(record)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not update line: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Line with id ${id} not found`);
    }

    return this.toDomain(data as LineRecord);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not delete line: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Line with id ${id} not found`);
    }
  }

  private toDomain(record: LineRecord): Line {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  private toRecord(payload: Partial<CreateLineDto | UpdateLineDto>): Partial<LineRecord> {
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
