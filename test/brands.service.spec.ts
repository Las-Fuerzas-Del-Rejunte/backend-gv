import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from '../src/modules/brands/brands.service';
import { BrandsRepository } from '../src/modules/brands/repositories/brands.repository';
import { Brand } from '../src/modules/brands/entities/brand.entity';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: BrandsRepository;

  const mockBrand: Brand = {
    id: '1',
    userId: 'user1',
    name: 'Brand1',
    description: 'desc',
    logo: null,
    createdAt: '2025-10-19',
    updatedAt: '2025-10-19',
  };

  const repoMock = {
    findAll: jest.fn().mockResolvedValue([mockBrand]),
    findById: jest.fn().mockResolvedValue(mockBrand),
    create: jest.fn().mockResolvedValue(mockBrand),
    update: jest.fn().mockResolvedValue(mockBrand),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: BrandsRepository, useValue: repoMock },
      ],
    }).compile();
    service = module.get<BrandsService>(BrandsService);
    repository = module.get<BrandsRepository>(BrandsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return brands', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockBrand]);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a brand', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockBrand);
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('create should return created brand', async () => {
    const result = await service.create({} as any);
    expect(result).toEqual(mockBrand);
    expect(repository.create).toHaveBeenCalled();
  });

  it('update should return updated brand', async () => {
    const result = await service.update('1', {} as any);
    expect(result).toEqual(mockBrand);
    expect(repository.update).toHaveBeenCalledWith('1', {});
  });

  it('remove should call repository', async () => {
    await service.remove('1');
    expect(repository.remove).toHaveBeenCalledWith('1');
  });

  it('findOne should throw if not found', async () => {
    repoMock.findById.mockRejectedValueOnce(new Error('not found'));
    await expect(service.findOne('2')).rejects.toThrow('not found');
  });

  it('create should throw on error', async () => {
    repoMock.create.mockRejectedValueOnce(new Error('create error'));
    await expect(service.create({} as any)).rejects.toThrow('create error');
  });

  it('update should throw on error', async () => {
    repoMock.update.mockRejectedValueOnce(new Error('update error'));
    await expect(service.update('1', {} as any)).rejects.toThrow('update error');
  });

  it('remove should throw on error', async () => {
    repoMock.remove.mockRejectedValueOnce(new Error('remove error'));
    await expect(service.remove('1')).rejects.toThrow('remove error');
  });

  it('findAll should return empty array if no brands', async () => {
    repoMock.findAll.mockResolvedValueOnce([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
