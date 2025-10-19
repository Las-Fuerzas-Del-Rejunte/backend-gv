import "reflect-metadata";
import { CreateCategoryDto } from 'src/modules/categories/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/categories/dto/update-category.dto';
import { validate } from 'class-validator';

describe('CreateCategoryDto', () => {
  it('should be defined', () => {
    expect(new CreateCategoryDto()).toBeDefined();
  });
});

describe('UpdateCategoryDto', () => {
  it('should be defined', () => {
    expect(new UpdateCategoryDto()).toBeDefined();
  });
});
