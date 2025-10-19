import "reflect-metadata";
import { UpdateSaleDto, UpdateSaleItemDto } from 'src/modules/sales/dto/update-sale.dto';
import { validate } from 'class-validator';

describe('UpdateSaleDto', () => {
  it('should be defined', () => {
    expect(new UpdateSaleDto()).toBeDefined();
  });
});

describe('UpdateSaleItemDto', () => {
  it('should be defined', () => {
    expect(new UpdateSaleItemDto()).toBeDefined();
  });

  it('should validate required fields', async () => {
    const dto = new UpdateSaleItemDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
