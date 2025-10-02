import { SaleItem } from './sale-item.entity';

export interface Sale {
  id: string;
  employeeId: string;
  totalAmount: number;
  saleDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}
