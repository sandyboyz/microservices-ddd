import { Product } from "../domains/Product";
import { PostgresProductMapper } from "../mappers/PostgresProductMapper";
import { Client } from "pg";
import { IProductRepository } from "./IProductRepository";
import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";

export const PRODUCT_LIMIT_DATA = 10;

export class PostgresProductRepository implements IProductRepository {
  constructor(private client: Client) {}

  async retrieveAll(page = 1): Promise<Product[]> {
    const methodName = `retrieveAll`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM products LIMIT $1 OFFSET $2",
      [PRODUCT_LIMIT_DATA, (page - 1) * PRODUCT_LIMIT_DATA]
    );

    let products: Product[] = [];

    if (result) {
      products = result.rows.map(PostgresProductMapper.toDomain);
    }

    console.log({ methodName, message: "END" });

    return products;
  }

  async count(): Promise<number> {
    const methodName = `count`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query("SELECT COUNT(*) FROM products");

    let count: number = 0;

    if (result.rows.length > 0) {
      count = result.rows[0].count;
    }

    console.log({ methodName, message: "END" });

    return count;
  }

  async retrieveById(id: UniqueEntityID): Promise<Product | undefined> {
    const methodName = `retrieveById`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM products WHERE id = $1",
      [id.toString()]
    );

    let product: Product | undefined;

    if (result.rows.length > 0) {
      product = PostgresProductMapper.toDomain(result.rows[0]);
    }

    console.log({ methodName, message: "END" });

    return product;
  }

  async retrieveBySku(sku: string): Promise<Product | undefined> {
    const methodName = `retrieveBySku`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM products WHERE sku = $1",
      [sku]
    );

    let product: Product | undefined;

    if (result.rows.length > 0) {
      product = PostgresProductMapper.toDomain(result.rows[0]);
    }

    console.log({ methodName, message: "END" });

    return product;
  }

  async create(product: Product): Promise<void> {
    const methodName = `create`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresProductMapper.toPersistence(product);

    await this.client.query(
      "INSERT INTO products(id, name, sku, image, price, description) VALUES($1, $2, $3, $4, $5, $6)",
      [
        props.id,
        props.name,
        props.sku,
        props.image,
        props.price,
        props.description,
      ]
    );

    console.log({ methodName, message: "END" });
  }

  async update(product: Product): Promise<void> {
    const methodName = `update`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresProductMapper.toPersistence(product);

    await this.client.query(
      "UPDATE products SET name = $1, sku = $2, image = $3, price = $4, description = $5 WHERE id = $6",
      [
        props.name,
        props.sku,
        props.image,
        props.price,
        props.description,
        props.id,
      ]
    );

    console.log({ methodName, message: "END" });
  }

  async delete(product: Product): Promise<void> {
    const methodName = `create`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresProductMapper.toPersistence(product);

    await this.client.query("DELETE FROM products WHERE id = $1", [props.id]);

    console.log({ methodName, message: "END" });
  }
}

// (async function () {
//   const client = new Client({
//     host: "localhost",
//     port: 5433,
//     user: "postgres",
//     password: "mysecretpassword",
//     database: "product_db",
//   });

//   await client.connect();

//   const productRepository = new PostgresProductRepository(client);

//   const products = await productRepository.retrieveAll(1);

//   console.log(products.length, "JKW");

//   console.log("logLESS", products);
// })();
