import { Injectable } from '@nestjs/common';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.findAll();
  }

  findOne(id: string): Promise<Supplier> {
    return this.suppliersRepository.findById(id);
  }

  create(payload: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersRepository.create(payload);
  }

  update(id: string, payload: UpdateSupplierDto): Promise<Supplier> {
    return this.suppliersRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.suppliersRepository.remove(id);
  }
}
