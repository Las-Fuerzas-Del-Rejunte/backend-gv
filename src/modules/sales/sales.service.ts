import { Injectable } from '@nestjs/common';
import { SalesRepository } from './repositories/sales.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { SalesMetricsFilterDto } from './dto/sales-metrics-filter.dto';

export interface SalesBrandSummary {
  brandId: string;
  brandName: string | null;
  revenue: number;
  units: number;
}

export interface SalesProductSummary {
  productId: string;
  productName: string;
  revenue: number;
  units: number;
}

export interface SalesSummaryMetrics {
  totalRevenue: number;
  totalUnits: number;
  totalOrders: number;
  byBrand: SalesBrandSummary[];
  byProduct: SalesProductSummary[];
}

export interface SalesMonthlyMetric {
  month: string;
  revenue: number;
  units: number;
  orders: number;
}

interface MetricItem {
  saleId: string;
  saleDate: string;
  productId: string;
  productName: string;
  brandId: string;
  brandName: string | null;
  lineId: string | null;
  suppliers: string[];
  quantity: number;
  revenue: number;
}

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  findAll(): Promise<Sale[]> {
    return this.salesRepository.findAll();
  }

  findOne(id: string): Promise<Sale> {
    return this.salesRepository.findById(id);
  }

  create(payload: CreateSaleDto): Promise<Sale> {
    return this.salesRepository.create(payload);
  }

  update(id: string, payload: UpdateSaleDto): Promise<Sale> {
    return this.salesRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.salesRepository.remove(id);
  }

  findByEmployee(employeeId: string): Promise<Sale[]> {
    return this.salesRepository.findByEmployee(employeeId);
  }

  findByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return this.salesRepository.findByDateRange(startDate, endDate);
  }

  async getSummaryMetrics(
    filters: SalesMetricsFilterDto,
  ): Promise<SalesSummaryMetrics> {
    const items = await this.loadMetricItems(filters);

    const orderIds = new Set<string>();
    const brandMap = new Map<
      string,
      { brandName: string | null; revenue: number; units: number }
    >();
    const productMap = new Map<
      string,
      { productName: string; revenue: number; units: number }
    >();

    let totalRevenue = 0;
    let totalUnits = 0;

    for (const item of items) {
      orderIds.add(item.saleId);
      totalRevenue += item.revenue;
      totalUnits += item.quantity;

      const brandEntry = brandMap.get(item.brandId) ?? {
        brandName: item.brandName,
        revenue: 0,
        units: 0,
      };
      brandEntry.revenue += item.revenue;
      brandEntry.units += item.quantity;
      brandMap.set(item.brandId, brandEntry);

      const productEntry = productMap.get(item.productId) ?? {
        productName: item.productName,
        revenue: 0,
        units: 0,
      };
      productEntry.revenue += item.revenue;
      productEntry.units += item.quantity;
      productMap.set(item.productId, productEntry);
    }

    const byBrand: SalesBrandSummary[] = Array.from(brandMap.entries())
      .map(([brandId, entry]) => ({
        brandId,
        brandName: entry.brandName,
        revenue: this.roundToTwoDecimals(entry.revenue),
        units: entry.units,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const byProduct: SalesProductSummary[] = Array.from(productMap.entries())
      .map(([productId, entry]) => ({
        productId,
        productName: entry.productName,
        revenue: this.roundToTwoDecimals(entry.revenue),
        units: entry.units,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue: this.roundToTwoDecimals(totalRevenue),
      totalUnits,
      totalOrders: orderIds.size,
      byBrand,
      byProduct,
    };
  }

  async getMonthlyMetrics(
    filters: SalesMetricsFilterDto,
  ): Promise<SalesMonthlyMetric[]> {
    const items = await this.loadMetricItems(filters);

    const monthMap = new Map<
      string,
      { revenue: number; units: number; orders: Set<string> }
    >();

    for (const item of items) {
      const monthKey = this.getMonthKey(item.saleDate);
      const entry = monthMap.get(monthKey) ?? {
        revenue: 0,
        units: 0,
        orders: new Set<string>(),
      };
      entry.revenue += item.revenue;
      entry.units += item.quantity;
      entry.orders.add(item.saleId);
      monthMap.set(monthKey, entry);
    }

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, entry]) => ({
        month,
        revenue: this.roundToTwoDecimals(entry.revenue),
        units: entry.units,
        orders: entry.orders.size,
      }));
  }

  private async loadMetricItems(
    filters: SalesMetricsFilterDto,
  ): Promise<MetricItem[]> {
    const records = await this.salesRepository.findMetricsData(filters);
    const items: MetricItem[] = [];

    for (const sale of records) {
      const saleItems = sale.sale_items ?? [];

      for (const item of saleItems) {
        const product = item.product;
        if (!product) {
          continue;
        }

        if (filters.productId && product.id !== filters.productId) {
          continue;
        }

        if (filters.brandId && product.brand_id !== filters.brandId) {
          continue;
        }

        if (filters.lineId && product.line_id !== filters.lineId) {
          continue;
        }

        const suppliers = (product.product_suppliers ?? []).map(
          (supplier) => supplier.supplier_id,
        );
        if (filters.supplierId && !suppliers.includes(filters.supplierId)) {
          continue;
        }

        items.push({
          saleId: sale.id,
          saleDate: sale.sale_date,
          productId: product.id,
          productName: product.name,
          brandId: product.brand_id,
          brandName: product.brand?.name ?? null,
          lineId: product.line_id ?? null,
          suppliers,
          quantity: item.quantity,
          revenue: this.parseNumber(item.subtotal),
        });
      }
    }

    return items;
  }

  private parseNumber(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private getMonthKey(date: string): string {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getUTCFullYear();
      const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }

    return date.slice(0, 7);
  }
}
