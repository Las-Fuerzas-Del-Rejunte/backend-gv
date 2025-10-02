export interface Product {
  id: string;
  userId: string;
  brandId: string;
  lineId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  image?: string | null;
  stockQuantity: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}
