import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandsRepository } from './repositories/brands.repository';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  findAll(): Promise<Brand[]> {
    return this.brandsRepository.findAll();
  }

  findOne(id: string): Promise<Brand> {
    return this.brandsRepository.findById(id);
  }

  create(payload: CreateBrandDto): Promise<Brand> {
    return this.brandsRepository.create(payload);
  }

  update(id: string, payload: UpdateBrandDto): Promise<Brand> {
    return this.brandsRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.brandsRepository.remove(id);
  }
}
