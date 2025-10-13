import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  findOne(id: string): Promise<Category> {
    return this.categoriesRepository.findById(id);
  }

  create(payload: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(payload);
  }

  update(id: string, payload: UpdateCategoryDto): Promise<Category> {
    return this.categoriesRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.categoriesRepository.remove(id);
  }
}
