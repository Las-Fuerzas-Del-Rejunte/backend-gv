
import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from '../src/modules/sales/sales.controller';
import { SalesService } from '../src/modules/sales/sales.service';

class MockSalesService {
  findAll = jest.fn().mockResolvedValue([]);
  findByEmployee = jest.fn().mockResolvedValue([]);
  findByDateRange = jest.fn().mockResolvedValue([]);
  getSummaryMetrics = jest.fn().mockResolvedValue({ totalRevenue: 0, totalUnits: 0, totalOrders: 0, byBrand: [], byProduct: [] });
  findOne = jest.fn().mockResolvedValue({ id: '1', total: 100 });
}

describe('SalesController', () => {
  let controller: SalesController;
  let service: MockSalesService;

  beforeEach(async () => {
      service = new MockSalesService();

      const module: TestingModule = await Test.createTestingModule({
        controllers: [SalesController],
        providers: [
          { provide: SalesService, useValue: service },
        ],
      })
      .overrideProvider(SalesService)
      .useValue(service)
      .compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findByEmployee should return an array', async () => {
    const result = await controller.findByEmployee('1');
    expect(Array.isArray(result)).toBe(true);
    expect(service.findByEmployee).toHaveBeenCalledWith('1');
  });

  it('findByDateRange should return an array', async () => {
    const result = await controller.findByDateRange('2023-01-01', '2023-01-31');
    expect(Array.isArray(result)).toBe(true);
    expect(service.findByDateRange).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
  });

  it('getSummaryMetrics should return metrics', async () => {
    const result = await controller.getSummaryMetrics({} as any);
    expect(result).toHaveProperty('totalRevenue');
    expect(service.getSummaryMetrics).toHaveBeenCalled();
  });
});
