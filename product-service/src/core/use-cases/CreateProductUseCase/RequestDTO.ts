export interface CreateProductRequestDTO {
  name: string;
  sku: string
  image: string;
  price: number;
  description?: string;
}
