import { Client } from "pg";
import { PostgresProductRepository } from "./core/repository/PostgresProductRepository";
import { RetrieveProductListUseCase } from "./core/use-cases/RetrieveProductListUseCase";
import dotenv from "dotenv";
import { TransactionProvider } from "./core/providers/TransactionProvider";
import { RetrieveProductBySKUUseCase } from "./core/use-cases/RetrieveProductBySKUUseCase";
import { CreateProductUseCase } from "./core/use-cases/CreateProductUseCase";
import { UpdateProductUseCase } from "./core/use-cases/UpdateProductUseCase";
import { DeleteProductUseCase } from "./core/use-cases/DeleteProductUseCase";
import axios from "axios";
import { EleveniaProvider } from "./core/providers/EleveniaProvider";
import { InitialProductUseCase } from "./core/use-cases/InitialProductUseCase";
import { RetrieveProductByIdUseCase } from "./core/use-cases/RetrieveProductByIdUseCase";

dotenv.config({
  path: process.cwd() + "/.env",
});

const client = new Client({
  host: process.env.DB_HOST ? process.env.DB_HOST : "localhost",
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5433,
  user: process.env.DB_USER ? process.env.DB_USER : "postgres",
  password: process.env.DB_PASSWORD
    ? process.env.DB_PASSWORD
    : "mysecretpassword",
  database: process.env.DB_NAME ? process.env.DB_NAME : "product_db",
});

const productRepository = new PostgresProductRepository(client);
const transactionProvider = new TransactionProvider(axios.create({
    baseURL: `http://${process.env.TRANSACTION_SERVICE}:4000`
}));

const eleveniaProvider = new EleveniaProvider(
  axios.create({
    baseURL: "http://api.elevenia.co.id/rest/prodservices",
    headers: {
      openapikey: process.env.ELEVENIA_API_KEY || "",
    },
  })
);

export async function initConnection() {
  await client.connect();
}

export const productsUseCase = {
  retrieveProductList: new RetrieveProductListUseCase(
    productRepository,
    transactionProvider
  ),
  retrieveProductBySKUUseCase: new RetrieveProductBySKUUseCase(
    productRepository,
    transactionProvider
  ),
  retrieveProductByIdUseCase: new RetrieveProductByIdUseCase(
    productRepository,
    transactionProvider
  ),
  createProduct: new CreateProductUseCase(productRepository),
  updateProduct: new UpdateProductUseCase(productRepository),
  deleteProduct: new DeleteProductUseCase(productRepository, transactionProvider),
  initialProduct: new InitialProductUseCase(productRepository, eleveniaProvider, transactionProvider),
};
