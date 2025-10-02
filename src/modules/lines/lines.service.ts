import { Injectable } from '@nestjs/common';
import { LinesRepository } from './repositories/lines.repository';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { Line } from './entities/line.entity';

@Injectable()
export class LinesService {
  constructor(private readonly linesRepository: LinesRepository) {}

  findAll(): Promise<Line[]> {
    return this.linesRepository.findAll();
  }

  findOne(id: string): Promise<Line> {
    return this.linesRepository.findById(id);
  }

  create(payload: CreateLineDto): Promise<Line> {
    return this.linesRepository.create(payload);
  }

  update(id: string, payload: UpdateLineDto): Promise<Line> {
    return this.linesRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.linesRepository.remove(id);
  }
}
