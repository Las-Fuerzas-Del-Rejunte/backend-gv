import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { CreateSaleDto, CreateSaleItemDto } from '../dto/create-sale.dto';
import { UpdateSaleDto, UpdateSaleItemDto } from '../dto/update-sale.dto';
import { SalesMetricsFilterDto } from '../dto/sales-metrics-filter.dto';

type SalePayload = Partial<CreateSaleDto> | Partial<UpdateSaleDto>;
type SaleItemInput = CreateSaleItemDto | UpdateSaleItemDto;

interface SaleRecord {
  id: string;
  employee_id: string;
  total_amount: string | number;
  sale_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItemRecord[];
}

interface SaleItemRecord {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  created_at: string;
}

interface MetricsProductRecord {
  id: string;
  name: string;
  brand_id: string;
  line_id: string | null;
  category_id?: string | null;
  brand?: { id: string; name: string } | null;
  line?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

interface MetricsSaleItemRecord extends SaleItemRecord {
  product?: MetricsProductRecord | null;
}

interface MetricsSaleRecord extends SaleRecord {
  sale_items?: MetricsSaleItemRecord[];
}

@Injectable()
export class SalesRepository {
  private readonly salesTable = 'sales';
  private readonly saleItemsTable = 'sale_items';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Sale[]> {
    const response = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .order('sale_date', { ascending: false });

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch sales: ${response.error.message}`,
      );
    }

    const records = (response.data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Sale> {
    const response = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .eq('id', id)
      .maybeSingle();

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch sale: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    return this.toDomain(response.data as SaleRecord);
  }

  async findByEmployee(employeeId: string): Promise<Sale[]> {
    const response = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .eq('employee_id', employeeId)
      .order('sale_date', { ascending: false });

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch sales by employee: ${response.error.message}`,
      );
    }

    const records = (response.data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const response = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: false });

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch sales by date range: ${response.error.message}`,
      );
    }

    const records = (response.data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async create(payload: CreateSaleDto): Promise<Sale> {
    const totalAmount = this.calculateTotal(payload.items, payload.totalAmount);
    const saleRecord = this.toSaleRecord(payload, totalAmount);

    const saleResponse = await this.supabase.client
      .from(this.salesTable)
      .insert(saleRecord)
      .select('*')
      .single();

    if (saleResponse.error || !saleResponse.data) {
      throw new InternalServerErrorException(
        `Could not create sale: ${saleResponse.error?.message}`,
      );
    }

    const saleId = (saleResponse.data as SaleRecord).id;

    const saleItemsRecords = payload.items.map((item) =>
      this.toSaleItemRecord(item, saleId),
    );

    const itemsResponse = await this.supabase.client
      .from(this.saleItemsTable)
      .insert(saleItemsRecords);

    if (itemsResponse.error) {
      await this.supabase.client
        .from(this.salesTable)
        .delete()
        .eq('id', saleId);
      throw new InternalServerErrorException(
        `Could not create sale items: ${itemsResponse.error.message}`,
      );
    }

    return this.findById(saleId);
  }

  async update(id: string, payload: UpdateSaleDto): Promise<Sale> {
    await this.ensureSaleExists(id);

    const totalAmount = payload.items
      ? this.calculateTotal(payload.items, payload.totalAmount)
      : payload.totalAmount;

    const saleRecord = this.toSaleRecord(payload, totalAmount);

    if (Object.keys(saleRecord).length > 0) {
      const updateResponse = await this.supabase.client
        .from(this.salesTable)
        .update(saleRecord)
        .eq('id', id);

      if (updateResponse.error) {
        throw new InternalServerErrorException(
          `Could not update sale: ${updateResponse.error.message}`,
        );
      }
    }

    if (payload.items) {
      const deleteResponse = await this.supabase.client
        .from(this.saleItemsTable)
        .delete()
        .eq('sale_id', id);

      if (deleteResponse.error) {
        throw new InternalServerErrorException(
          `Could not reset sale items: ${deleteResponse.error.message}`,
        );
      }

      const saleItemsRecords = payload.items.map((item) =>
        this.toSaleItemRecord(item, id),
      );

      const insertResponse = await this.supabase.client
        .from(this.saleItemsTable)
        .insert(saleItemsRecords);

      if (insertResponse.error) {
        throw new InternalServerErrorException(
          `Could not update sale items: ${insertResponse.error.message}`,
        );
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.ensureSaleExists(id);

    const itemsDeleteResponse = await this.supabase.client
      .from(this.saleItemsTable)
      .delete()
      .eq('sale_id', id);

    if (itemsDeleteResponse.error) {
      throw new InternalServerErrorException(
        `Could not delete sale items: ${itemsDeleteResponse.error.message}`,
      );
    }

    const saleDeleteResponse = await this.supabase.client
      .from(this.salesTable)
      .delete()
      .eq('id', id);

    if (saleDeleteResponse.error) {
      throw new InternalServerErrorException(
        `Could not delete sale: ${saleDeleteResponse.error.message}`,
      );
    }
  }

  async findMetricsData(
    filters: SalesMetricsFilterDto,
  ): Promise<MetricsSaleRecord[]> {
    const query = this.supabase.client
      .from(this.salesTable)
      .select(
        `
        id,
        employee_id,
        total_amount,
        sale_date,
        notes,
        created_at,
        updated_at,
        sale_items (
          id,
          sale_id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          created_at,
          product:products (
            id,
            name,
            brand_id,
            line_id,
            category_id,
            brand:brands ( id, name ),
            line:lines ( id, name ),
            category:categories ( id, name )
          )
        )
      `,
      )
      .order('sale_date', { ascending: true });

    if (filters.startDate) {
      query.gte('sale_date', filters.startDate);
    }

    if (filters.endDate) {
      query.lte('sale_date', filters.endDate);
    }

    const response = await query;

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not fetch sales metrics: ${response.error.message}`,
      );
    }

    const metrics = (response.data ?? []) as unknown;
    return metrics as MetricsSaleRecord[];
  }

  private async ensureSaleExists(id: string): Promise<void> {
    const response = await this.supabase.client
      .from(this.salesTable)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (response.error) {
      throw new InternalServerErrorException(
        `Could not verify sale: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
  }

  private toDomain(record: SaleRecord): Sale {
    return {
      id: record.id,
      employeeId: record.employee_id,
      totalAmount: this.parseNumber(record.total_amount),
      saleDate: record.sale_date,
      notes: record.notes ?? null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      items: (record.sale_items ?? []).map((item) => this.toSaleItem(item)),
    };
  }

  private toSaleItem(record: SaleItemRecord): SaleItem {
    return {
      id: record.id,
      saleId: record.sale_id,
      productId: record.product_id,
      quantity: record.quantity,
      unitPrice: this.parseNumber(record.unit_price),
      subtotal: this.parseNumber(record.subtotal),
      createdAt: record.created_at,
    };
  }

  private toSaleRecord(
    payload: SalePayload,
    totalAmount?: number,
  ): Partial<SaleRecord> {
    const record: Partial<SaleRecord> = {};

    if ('employeeId' in payload && payload.employeeId !== undefined) {
      record.employee_id = payload.employeeId;
    }

    if (totalAmount !== undefined) {
      record.total_amount = totalAmount;
    }

    if ('saleDate' in payload && payload.saleDate !== undefined) {
      record.sale_date = payload.saleDate;
    }

    if ('notes' in payload && payload.notes !== undefined) {
      record.notes = payload.notes;
    }

    return record;
  }

  private toSaleItemRecord(
    item: SaleItemInput,
    saleId: string,
  ): Partial<SaleItemRecord> {
    const subtotal = this.roundToTwoDecimals(item.unitPrice * item.quantity);

    return {
      sale_id: saleId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal,
    };
  }

  private calculateTotal(items: SaleItemInput[], explicit?: number): number {
    if (explicit !== undefined) {
      return this.roundToTwoDecimals(explicit);
    }

    const sum = items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);

    return this.roundToTwoDecimals(sum);
  }

  private parseNumber(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
