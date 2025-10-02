import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findById(id);
  }

  create(payload: CreateProductDto): Promise<Product> {
    return this.productsRepository.create(payload);
  }

  update(id: string, payload: UpdateProductDto): Promise<Product> {
    return this.productsRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.productsRepository.remove(id);
  }

  async findLowStock(): Promise<Product[]> {
    const products = await this.productsRepository.findAll();
    return products.filter((product) => product.stockQuantity <= product.minStock);
  }
}
