import "reflect-metadata";
import { SalesMetricsFilterDto } from 'src/modules/sales/dto/sales-metrics-filter.dto';
import { validate } from 'class-validator';

describe('SalesMetricsFilterDto', () => {
  it('should be defined', () => {
    expect(new SalesMetricsFilterDto()).toBeDefined();
  });
});
