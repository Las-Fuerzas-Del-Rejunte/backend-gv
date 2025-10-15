export interface Brand {
  id: string;
  name: string;
}

export interface Line {
  id: string;
  brandId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: Brand;
}
