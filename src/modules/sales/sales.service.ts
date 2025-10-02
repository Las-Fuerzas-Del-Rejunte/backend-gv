import { Injectable } from '@nestjs/common';
import { SalesRepository } from './repositories/sales.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  findAll(): Promise<Sale[]> {
    return this.salesRepository.findAll();
  }

  findOne(id: string): Promise<Sale> {
    return this.salesRepository.findById(id);
  }

  create(payload: CreateSaleDto): Promise<Sale> {
    return this.salesRepository.create(payload);
  }

  update(id: string, payload: UpdateSaleDto): Promise<Sale> {
    return this.salesRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.salesRepository.remove(id);
  }

  findByEmployee(employeeId: string): Promise<Sale[]> {
    return this.salesRepository.findByEmployee(employeeId);
  }

  findByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return this.salesRepository.findByDateRange(startDate, endDate);
  }
}
