import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../../common/adapters/supabase-adapter';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export interface CategoryRecord {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class CategoriesSupabaseAdapter
  implements
    SupabaseAdapter<
      CategoryRecord,
      Category,
      CreateCategoryDto,
      UpdateCategoryDto
    >
{
  toDomain(record: CategoryRecord): Category {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  toRecord(
    payload: Partial<CreateCategoryDto | UpdateCategoryDto>,
  ): Partial<CategoryRecord> {
    const record: Partial<CategoryRecord> = {};

    if (payload.name !== undefined) {
      record.name = payload.name;
    }

    if (payload.description !== undefined) {
      record.description = payload.description;
    }

    return record;
  }
}
