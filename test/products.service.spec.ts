
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../src/modules/products/products.service';

class MockProductsRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockImplementation((id) => {
    // Si el id es '1' y se espera un producto creado, devolver el nombre correcto
    if (this._lastCreatedName) {
      return Promise.resolve({ id, name: this._lastCreatedName });
    }
    return Promise.resolve({ id, name: 'Test Product' });
  });
  create = jest.fn().mockImplementation((payload) => {
    this._lastCreatedName = payload.name;
    return Promise.resolve({ id: '1', name: payload.name });
  });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Product' });
  remove = jest.fn().mockResolvedValue(undefined);
  _lastCreatedName?: string;
}
class MockBrandsService {
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Brand' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Brand' });
  remove = jest.fn().mockResolvedValue(undefined);
}
class MockLinesService {
  findOne = jest.fn().mockImplementation((id) => {
    // Simula que la línea pertenece a la marca correcta
    return Promise.resolve({ id, name: 'Line', brandId: '1' });
  });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Line', brandId: '1' });
  remove = jest.fn().mockResolvedValue(undefined);
}
class MockCategoriesService {
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Category' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Category' });
  remove = jest.fn().mockResolvedValue(undefined);
}
class MockClientsService {
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Client' });
}

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: MockProductsRepository;
  let brandsService: MockBrandsService;
  let linesService: MockLinesService;
  let categoriesService: MockCategoriesService;
  let clientsService: MockClientsService;

  beforeEach(async () => {
    repository = new MockProductsRepository();
    brandsService = new MockBrandsService();
    linesService = new MockLinesService();
    categoriesService = new MockCategoriesService();
    clientsService = new MockClientsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: 'ProductsRepository', useValue: repository },
        { provide: 'BrandsService', useValue: brandsService },
        { provide: 'LinesService', useValue: linesService },
        { provide: 'CategoriesService', useValue: categoriesService },
        { provide: 'ClientsService', useValue: clientsService },
      ],
    })
      .overrideProvider(ProductsService)
      .useFactory({
        factory: () => new ProductsService(
          repository as any,
          brandsService as any,
          linesService as any,
          categoriesService as any,
          clientsService as any,
        ),
      })
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a product', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Product' });
    expect(repository.findById).toHaveBeenCalledWith('1');
  });


  it('create should return created product', async () => {
    const payload = {
      name: 'Created Product',
      brandId: '1',
      lineId: '1',
      categoryId: '1',
      clientId: '1',
      userId: 'user-1',
      price: 100,
      stockQuantity: 10,
      minStock: 2,
    };
    const result = await service.create(payload as any);
    expect(result).toEqual({ id: '1', name: 'Created Product' });
    expect(repository.create).toHaveBeenCalled();
  });

  it('update should return updated product', async () => {
    const payload = { name: 'Updated Product', userId: 'user-1', brandId: '1', lineId: '1' };
    const result = await service.update('1', payload as any);
    expect(result).toEqual({ id: '1', name: 'Updated Product' });
    expect(repository.update).toHaveBeenCalled();
  });

  it('should throw if no brandId or newBrand', async () => {
    await expect(service.create({
      name: 'fail',
      userId: 'user-1',
      price: 1,
      stockQuantity: 1,
      lineId: '1',
    } as any)).rejects.toThrow('A brand reference is required.');
  });

  it('should throw if no lineId or newLine', async () => {
    await expect(service.create({
      name: 'fail',
      userId: 'user-1',
      price: 1,
      stockQuantity: 1,
      brandId: '1',
    } as any)).rejects.toThrow('A line reference is required.');
  });

  it('should throw if line does not belong to brand', async () => {
    // Cambia el mock para simular error
    linesService.findOne = jest.fn().mockResolvedValue({ id: '2', name: 'Line', brandId: 'other-brand' });
    await expect(service.create({
      name: 'fail',
      userId: 'user-1',
      price: 1,
      stockQuantity: 1,
      brandId: '1',
      lineId: '2',
    } as any)).rejects.toThrow('The selected line does not belong to the chosen brand.');
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });

  // Más tests para cobertura
  it('should create product with newBrand y newLine', async () => {
    const payload = {
      name: 'Nuevo',
      newBrand: { name: 'BrandX' },
      newLine: { name: 'LineX' },
      userId: 'user-1',
      price: 10,
      stockQuantity: 5,
      minStock: 1,
    };
    const result = await service.create(payload as any);
    expect(result).toBeDefined();
    expect(brandsService.create).toHaveBeenCalled();
    expect(linesService.create).toHaveBeenCalled();
  });

  it('should create product with newCategory', async () => {
    const payload = {
      name: 'Nuevo',
      brandId: '1',
      lineId: '1',
      newCategory: { name: 'CatX' },
      userId: 'user-1',
      price: 10,
      stockQuantity: 5,
      minStock: 1,
    };
    const result = await service.create(payload as any);
    expect(result).toBeDefined();
    expect(categoriesService.create).toHaveBeenCalled();
  });

  it('should update product with newBrand', async () => {
    const payload = { name: 'Update', newBrand: { name: 'BrandY' }, userId: 'user-1', lineId: '1' };
    const result = await service.update('1', payload as any);
    expect(result).toBeDefined();
    expect(brandsService.create).toHaveBeenCalled();
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });
});
