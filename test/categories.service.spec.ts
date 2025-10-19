
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../src/modules/categories/categories.service';

class MockCategoriesRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue({ id: '1', name: 'Test Category' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Category' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Category' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: MockCategoriesRepository;

  beforeEach(async () => {
    repository = new MockCategoriesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: 'CategoriesRepository', useValue: repository },
      ],
    })
      .overrideProvider(CategoriesService)
      .useFactory({
        factory: () => new CategoriesService(repository as any),
      })
      .compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a category', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Category' });
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('create should return created category', async () => {
    const payload = { name: 'Created Category' };
    const result = await service.create(payload as any);
    expect(result).toEqual({ id: '1', name: 'Created Category' });
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it('update should return updated category', async () => {
    const payload = { name: 'Updated Category' };
    const result = await service.update('1', payload as any);
    expect(result).toEqual({ id: '1', name: 'Updated Category' });
    expect(repository.update).toHaveBeenCalledWith('1', payload);
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });
});
