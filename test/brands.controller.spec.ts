import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from '../src/modules/brands/brands.controller';
import { BrandsService } from '../src/modules/brands/brands.service';
import { Brand } from '../src/modules/brands/entities/brand.entity';

describe('BrandsController', () => {
  let controller: BrandsController;
  let service: BrandsService;

  const mockBrand: Brand = {
    id: '1',
    userId: 'user1',
    name: 'Brand1',
    description: 'desc',
    logo: null,
    createdAt: '2025-10-19',
    updatedAt: '2025-10-19',
  };

  const serviceMock = {
    findAll: jest.fn().mockResolvedValue([mockBrand]),
    findOne: jest.fn().mockResolvedValue(mockBrand),
    create: jest.fn().mockResolvedValue(mockBrand),
    update: jest.fn().mockResolvedValue(mockBrand),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        { provide: BrandsService, useValue: serviceMock },
      ],
    }).compile();
    controller = module.get<BrandsController>(BrandsController);
    service = module.get<BrandsService>(BrandsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return brands', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockBrand]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should return a brand', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockBrand);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('create should return created brand', async () => {
    const result = await controller.create({} as any);
    expect(result).toEqual(mockBrand);
    expect(service.create).toHaveBeenCalled();
  });

  it('update should return updated brand', async () => {
    const result = await controller.update('1', {} as any);
    expect(result).toEqual(mockBrand);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  it('remove should call service', async () => {
    await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });

  it('findOne should throw if not found', async () => {
    serviceMock.findOne.mockRejectedValueOnce(new Error('not found'));
    await expect(controller.findOne('2')).rejects.toThrow('not found');
  });
});
