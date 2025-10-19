import { UpdateBrandDto } from '../src/modules/brands/dto/update-brand.dto';
import { validate } from 'class-validator';

describe('UpdateBrandDto', () => {
  it('should allow partial fields', async () => {
    const dto = new UpdateBrandDto();
    dto.name = 'BrandName';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow empty dto', async () => {
    const dto = new UpdateBrandDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
