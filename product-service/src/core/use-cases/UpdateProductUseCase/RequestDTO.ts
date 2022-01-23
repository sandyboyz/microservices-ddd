export interface UpdateProductRequestDTO {
  id: string;
  name: string;
  sku: string
  image: string;
  price: number;
  description?: string;
}
