import "reflect-metadata";
import { CreateProductDto, CreateProductBrandDto, CreateProductLineDto, CreateProductCategoryDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import { validate } from 'class-validator';

describe('CreateProductDto', () => {
  it('should be defined', () => {
    expect(new CreateProductDto()).toBeDefined();
  });
});

describe('UpdateProductDto', () => {
  it('should be defined', () => {
    expect(new UpdateProductDto()).toBeDefined();
  });
});

describe('CreateProductBrandDto', () => {
  it('should be defined', () => {
    expect(new CreateProductBrandDto()).toBeDefined();
  });
});

describe('CreateProductLineDto', () => {
  it('should be defined', () => {
    expect(new CreateProductLineDto()).toBeDefined();
  });
});

describe('CreateProductCategoryDto', () => {
  it('should be defined', () => {
    expect(new CreateProductCategoryDto()).toBeDefined();
  });
});
