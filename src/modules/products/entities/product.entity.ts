import { Category } from '../../categories/entities/category.entity';
import { Client } from '../../clients/entities/client.entity';

export interface Product {
  id: string;
  userId: string;
  brandId: string;
  lineId: string;
  categoryId?: string | null;
  clientId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  stockQuantity: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  client?: Client | null;
}
