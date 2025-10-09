import { BadRequestException, Injectable } from '@nestjs/common';
import { LinesRepository } from './repositories/lines.repository';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { Line } from './entities/line.entity';
import { BrandsService } from '../brands/brands.service';

@Injectable()
export class LinesService {
  constructor(
    private readonly linesRepository: LinesRepository,
    private readonly brandsService: BrandsService,
  ) {}

  findAll(): Promise<Line[]> {
    return this.linesRepository.findAll();
  }

  findOne(id: string): Promise<Line> {
    return this.linesRepository.findById(id);
  }

  async create(payload: CreateLineDto): Promise<Line> {
    await this.brandsService.findOne(payload.brandId);
    await this.ensureUniqueName(payload.brandId, payload.name);

    return this.linesRepository.create(payload);
  }

  async update(id: string, payload: UpdateLineDto): Promise<Line> {
    const existing = await this.linesRepository.findById(id);
    const brandId = payload.brandId ?? existing.brandId;
    const name = payload.name ?? existing.name;

    if (payload.brandId && payload.brandId !== existing.brandId) {
      await this.brandsService.findOne(payload.brandId);
    }

    if (payload.name || payload.brandId) {
      await this.ensureUniqueName(brandId, name, id);
    }

    return this.linesRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.linesRepository.remove(id);
  }

  private async ensureUniqueName(
    brandId: string,
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.linesRepository.findByBrandAndName(
      brandId,
      name,
    );

    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException(
        `Line name "${name}" is already used for this brand.`,
      );
    }
  }
}
