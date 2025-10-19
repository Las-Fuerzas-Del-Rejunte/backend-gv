import "reflect-metadata";
import { CreateSaleDto, CreateSaleItemDto } from 'src/modules/sales/dto/create-sale.dto';
import { validate } from 'class-validator';

describe('CreateSaleDto', () => {
  it('should be defined', () => {
    expect(new CreateSaleDto()).toBeDefined();
  });
});

describe('CreateSaleItemDto', () => {
  it('should be defined', () => {
    expect(new CreateSaleItemDto()).toBeDefined();
  });

  it('should validate required fields', async () => {
    const dto = new CreateSaleItemDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
