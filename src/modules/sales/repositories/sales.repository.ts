import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { CreateSaleDto, CreateSaleItemDto } from '../dto/create-sale.dto';
import { UpdateSaleDto, UpdateSaleItemDto } from '../dto/update-sale.dto';

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

@Injectable()
export class SalesRepository {
  private readonly salesTable = 'sales';
  private readonly saleItemsTable = 'sale_items';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Sale[]> {
    const { data, error } = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .order('sale_date', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch sales: ${error.message}`);
    }

    const records = (data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Sale> {
    const { data, error } = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not fetch sale: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    return this.toDomain(data as SaleRecord);
  }

  async findByEmployee(employeeId: string): Promise<Sale[]> {
    const { data, error } = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .eq('employee_id', employeeId)
      .order('sale_date', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch sales by employee: ${error.message}`);
    }

    const records = (data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const { data, error } = await this.supabase.client
      .from(this.salesTable)
      .select('*, sale_items(*)')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Could not fetch sales by date range: ${error.message}`);
    }

    const records = (data ?? []) as SaleRecord[];
    return records.map((record) => this.toDomain(record));
  }

  async create(payload: CreateSaleDto): Promise<Sale> {
    const totalAmount = this.calculateTotal(payload.items, payload.totalAmount);
    const saleRecord = this.toSaleRecord(payload, totalAmount);

    const { data: saleData, error: saleError } = await this.supabase.client
      .from(this.salesTable)
      .insert(saleRecord)
      .select('*')
      .single();

    if (saleError || !saleData) {
      throw new InternalServerErrorException(`Could not create sale: ${saleError?.message}`);
    }

    const saleId = (saleData as SaleRecord).id;

    const saleItemsRecords = payload.items.map((item) => this.toSaleItemRecord(item, saleId));

    const { error: saleItemsError } = await this.supabase.client
      .from(this.saleItemsTable)
      .insert(saleItemsRecords);

    if (saleItemsError) {
      await this.supabase.client.from(this.salesTable).delete().eq('id', saleId);
      throw new InternalServerErrorException(`Could not create sale items: ${saleItemsError.message}`);
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
      const { error: saleError } = await this.supabase.client
        .from(this.salesTable)
        .update(saleRecord)
        .eq('id', id);

      if (saleError) {
        throw new InternalServerErrorException(`Could not update sale: ${saleError.message}`);
      }
    }

    if (payload.items) {
      const { error: deleteError } = await this.supabase.client
        .from(this.saleItemsTable)
        .delete()
        .eq('sale_id', id);

      if (deleteError) {
        throw new InternalServerErrorException(`Could not reset sale items: ${deleteError.message}`);
      }

      const saleItemsRecords = payload.items.map((item) => this.toSaleItemRecord(item, id));

      const { error: insertError } = await this.supabase.client
        .from(this.saleItemsTable)
        .insert(saleItemsRecords);

      if (insertError) {
        throw new InternalServerErrorException(`Could not update sale items: ${insertError.message}`);
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.ensureSaleExists(id);

    const { error: itemsError } = await this.supabase.client
      .from(this.saleItemsTable)
      .delete()
      .eq('sale_id', id);

    if (itemsError) {
      throw new InternalServerErrorException(`Could not delete sale items: ${itemsError.message}`);
    }

    const { error: saleError } = await this.supabase.client
      .from(this.salesTable)
      .delete()
      .eq('id', id);

    if (saleError) {
      throw new InternalServerErrorException(`Could not delete sale: ${saleError.message}`);
    }
  }

  private async ensureSaleExists(id: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from(this.salesTable)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Could not verify sale: ${error.message}`);
    }

    if (!data) {
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

  private toSaleRecord(payload: SalePayload, totalAmount?: number): Partial<SaleRecord> {
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

  private toSaleItemRecord(item: SaleItemInput, saleId: string): Partial<SaleItemRecord> {
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

    const sum = (items as SaleItemInput[]).reduce((total, item) => {
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
