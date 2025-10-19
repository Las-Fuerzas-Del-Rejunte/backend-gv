
import { Test, TestingModule } from '@nestjs/testing';
import { LinesService } from '../src/modules/lines/lines.service';

class MockLinesRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue({ id: '1', name: 'Test Line', brandId: '1' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Line', brandId: '1' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Line', brandId: '1' });
  remove = jest.fn().mockResolvedValue(undefined);
  findByBrandAndName = jest.fn().mockResolvedValue(null);
}

class MockBrandsService {
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Test Brand' });
}

describe('LinesService', () => {
  let service: LinesService;
  let repository: MockLinesRepository;
  let brandsService: MockBrandsService;

  beforeEach(async () => {
    repository = new MockLinesRepository();
    brandsService = new MockBrandsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinesService,
        { provide: 'LinesRepository', useValue: repository },
        { provide: 'BrandsService', useValue: brandsService },
      ],
    })
      .overrideProvider(LinesService)
      .useFactory({
        factory: () => new LinesService(repository as any, brandsService as any),
      })
      .compile();

    service = module.get<LinesService>(LinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a line', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Line', brandId: '1' });
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('create should return created line', async () => {
    const payload = { name: 'Created Line', brandId: '1' };
    const result = await service.create(payload as any);
    expect(result).toEqual({ id: '1', name: 'Created Line', brandId: '1' });
    expect(brandsService.findOne).toHaveBeenCalledWith('1');
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it('update should return updated line', async () => {
    const payload = { name: 'Updated Line', brandId: '1' };
    const result = await service.update('1', payload as any);
    expect(result).toEqual({ id: '1', name: 'Updated Line', brandId: '1' });
    expect(repository.update).toHaveBeenCalledWith('1', payload);
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });
});
