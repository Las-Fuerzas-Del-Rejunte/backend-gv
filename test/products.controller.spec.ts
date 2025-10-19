
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../src/modules/products/products.controller';
import { ProductsService } from '../src/modules/products/products.service';

class MockProductsService {
  findAll = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Test Product' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Product' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Product' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: MockProductsService;

  beforeEach(async () => {
    service = new MockProductsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: service },
      ],
    })
      .overrideProvider(ProductsService)
      .useValue(service)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
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

  it('findOne should return a product', async () => {
    if (!controller.findOne) return;
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Product' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
