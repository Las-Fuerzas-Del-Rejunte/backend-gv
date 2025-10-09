import { ProductSupplier } from './product-supplier.entity';

export interface Product {
  id: string;
  userId: string;
  brandId: string;
  lineId: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  image?: string | null;
  stockQuantity: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  suppliers: ProductSupplier[];
}
