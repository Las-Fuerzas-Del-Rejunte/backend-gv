import { CreateBrandDto } from '../src/modules/brands/dto/create-brand.dto';
import { validate } from 'class-validator';

describe('CreateBrandDto', () => {
  it('should validate a valid dto', async () => {
    const dto = new CreateBrandDto();
    // UUID válido versión 4
    dto.userId = 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3';
    dto.name = 'BrandName';
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.error(errors);
    }
    expect(errors.length).toBe(0);
  });

  it('should fail if name is empty', async () => {
    const dto = new CreateBrandDto();
    dto.userId = 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3';
    dto.name = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if userId is not uuid', async () => {
    const dto = new CreateBrandDto();
    dto.userId = 'not-a-uuid';
    dto.name = 'BrandName';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
