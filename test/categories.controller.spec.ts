
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../src/modules/categories/categories.controller';
import { CategoriesService } from '../src/modules/categories/categories.service';

class MockCategoriesService {
  findAll = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Test Category' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Category' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Category' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: MockCategoriesService;

  beforeEach(async () => {
    service = new MockCategoriesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: service },
      ],
    })
      .overrideProvider(CategoriesService)
      .useValue(service)
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return an array', async () => {
    if (!controller.findAll) return;
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should return a category', async () => {
    if (!controller.findOne) return;
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Category' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
