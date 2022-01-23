import { Product } from "../domains/Product";

export interface JSONProductProps {
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

export class JSONProductSerializer {
  public static serialize(product: Product): JSONProductProps {
    return {
      id: product.id.toString(),
      name: product.name,
      sku: product.sku,
      image: product.image,
      price: product.price,
      description: product.description,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  public static serializeWithoutDescription(product: Product): JSONProductProps {
    return {
      id: product.id.toString(),
      name: product.name,
      sku: product.sku,
      image: product.image,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
