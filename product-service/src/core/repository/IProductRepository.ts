import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";
import { Product } from "../domains/Product";

export interface IProductRepository {
  retrieveAll(page: number): Promise<Product[]>;
  retrieveById(id: UniqueEntityID): Promise<Product | undefined>;
  retrieveBySku(sku: string): Promise<Product | undefined>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(product: Product): Promise<void>;
  count(): Promise<number>;
}
