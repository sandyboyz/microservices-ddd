import { Axios } from "axios";

export interface JSONProductResponse {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  description?: string;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductProvider {
  constructor(private client: Axios) {}

  public async getProduct(sku: string): Promise<JSONProductResponse> {
    const response = await this.client.get(`/products/sku/${sku}`);

    const data = response.data.data;

    return data;
  }
}
