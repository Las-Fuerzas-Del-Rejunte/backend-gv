export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}
