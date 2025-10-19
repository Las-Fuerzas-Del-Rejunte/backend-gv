
import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../src/modules/sales/sales.service';

class MockSalesRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue({ id: '1', total: 100 });
  findByEmployee = jest.fn().mockResolvedValue([]);
  findByDateRange = jest.fn().mockResolvedValue([]);
  getSummaryMetrics = jest.fn().mockResolvedValue({ totalRevenue: 0, totalUnits: 0, totalOrders: 0, byBrand: [], byProduct: [] });
  create = jest.fn().mockResolvedValue({ id: '1', total: 100 });
  update = jest.fn().mockResolvedValue({ id: '1', total: 200 });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('SalesService', () => {
  let service: SalesService;
  let repository: MockSalesRepository;

  beforeEach(async () => {
    repository = new MockSalesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: 'SalesRepository', useValue: repository },
      ],
    })
      .overrideProvider(SalesService)
      .useFactory({
        factory: () => new SalesService(repository as any),
      })
      .compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a sale', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', total: 100 });
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('create should return created sale', async () => {
    const payload = { total: 100 };
    const result = await service.create(payload as any);
    expect(result).toEqual({ id: '1', total: 100 });
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it('update should return updated sale', async () => {
    const payload = { total: 200 };
    const result = await service.update('1', payload as any);
    expect(result).toEqual({ id: '1', total: 200 });
    expect(repository.update).toHaveBeenCalledWith('1', payload);
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });

  // --- TESTS AVANZADOS PARA COBERTURA --- //

  describe('getSummaryMetrics', () => {
    it('debe devolver métricas resumidas correctamente', async () => {
      const mockItems = [
        { saleId: '1', saleDate: '2025-10-01', productId: 'p1', productName: 'Prod1', brandId: 'b1', brandName: 'Brand1', lineId: null, categoryId: null, categoryName: null, quantity: 2, revenue: 100 },
        { saleId: '2', saleDate: '2025-10-02', productId: 'p2', productName: 'Prod2', brandId: 'b2', brandName: 'Brand2', lineId: null, categoryId: null, categoryName: null, quantity: 1, revenue: 50 },
        { saleId: '1', saleDate: '2025-10-01', productId: 'p1', productName: 'Prod1', brandId: 'b1', brandName: 'Brand1', lineId: null, categoryId: null, categoryName: null, quantity: 1, revenue: 50 },
      ];
      jest.spyOn(service, 'loadMetricItems' as any).mockResolvedValue(mockItems);
      const filters = { brandId: undefined } as any;
      const result = await service.getSummaryMetrics(filters);
      expect(result.totalRevenue).toBe(200);
      expect(result.totalUnits).toBe(4);
      expect(result.totalOrders).toBe(2);
      expect(result.byBrand.length).toBe(2);
      expect(result.byProduct.length).toBe(2);
      expect(result.byBrand[0].brandName).toBe('Brand1');
      expect(result.byProduct[0].productName).toBe('Prod1');
    });
    it('debe devolver métricas vacías si no hay items', async () => {
      jest.spyOn(service, 'loadMetricItems' as any).mockResolvedValue([]);
      const result = await service.getSummaryMetrics({} as any);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalUnits).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(result.byBrand).toEqual([]);
      expect(result.byProduct).toEqual([]);
    });
  });

  describe('getMonthlyMetrics', () => {
    it('debe agrupar ventas por mes', async () => {
      const mockItems = [
        { saleId: '1', saleDate: '2025-10-01', productId: 'p1', productName: 'Prod1', brandId: 'b1', brandName: 'Brand1', lineId: null, categoryId: null, categoryName: null, quantity: 2, revenue: 100 },
        { saleId: '2', saleDate: '2025-11-01', productId: 'p2', productName: 'Prod2', brandId: 'b2', brandName: 'Brand2', lineId: null, categoryId: null, categoryName: null, quantity: 1, revenue: 50 },
        { saleId: '1', saleDate: '2025-10-01', productId: 'p1', productName: 'Prod1', brandId: 'b1', brandName: 'Brand1', lineId: null, categoryId: null, categoryName: null, quantity: 1, revenue: 50 },
      ];
      jest.spyOn(service, 'loadMetricItems' as any).mockResolvedValue(mockItems);
      const result = await service.getMonthlyMetrics({} as any);
      expect(result.length).toBe(2);
      expect(result[0].month).toBe('2025-10');
      expect(result[0].revenue).toBe(150);
      expect(result[0].units).toBe(3);
      expect(result[0].orders).toBe(1);
      expect(result[1].month).toBe('2025-11');
      expect(result[1].revenue).toBe(50);
      expect(result[1].units).toBe(1);
      expect(result[1].orders).toBe(1);
    });
    it('debe devolver array vacío si no hay items', async () => {
      jest.spyOn(service, 'loadMetricItems' as any).mockResolvedValue([]);
      const result = await service.getMonthlyMetrics({} as any);
      expect(result).toEqual([]);
    });
  });

  describe('manejo de errores del repositorio', () => {
    it('findAll lanza excepción del repositorio', async () => {
      repository.findAll = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.findAll()).rejects.toThrow('fail');
    });
    it('findOne lanza excepción del repositorio', async () => {
      repository.findById = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.findOne('x')).rejects.toThrow('fail');
    });
    it('create lanza excepción del repositorio', async () => {
      repository.create = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.create({} as any)).rejects.toThrow('fail');
    });
    it('update lanza excepción del repositorio', async () => {
      repository.update = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.update('x', {} as any)).rejects.toThrow('fail');
    });
    it('remove lanza excepción del repositorio', async () => {
      repository.remove = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.remove('x')).rejects.toThrow('fail');
    });
  });

  describe('parseNumber y roundToTwoDecimals', () => {
    it('parseNumber convierte string a número', () => {
      // @ts-ignore acceso a método privado
      expect((service as any).parseNumber('123.45')).toBeCloseTo(123.45);
      expect((service as any).parseNumber(99)).toBe(99);
    });
    it('roundToTwoDecimals redondea correctamente', () => {
      // @ts-ignore acceso a método privado
      expect((service as any).roundToTwoDecimals(12.345)).toBe(12.35);
      expect((service as any).roundToTwoDecimals(12.344)).toBe(12.34);
    });
    it('getMonthKey extrae año-mes', () => {
      // @ts-ignore acceso a método privado
  expect((service as any).getMonthKey('2025-10-19')).toBe('2025-10');
  expect((service as any).getMonthKey('invalid-date')).toBe('invalid');
    });
  });
});
