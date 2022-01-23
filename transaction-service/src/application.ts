import { Client } from "pg";
import { PostgresAdjustmentTransactionRepository } from "./core/repository/PostgresAdjustmentTransactionRepository";
import { RetrieveAdjustmentTransactionListUseCase } from "./core/use-cases/RetrieveAdjustmentTransactionListUseCase";
import dotenv from "dotenv";
import { ProductProvider } from "./core/providers/ProductProviders";
import { RetrieveAdjustmentTransactionByIdUseCase } from "./core/use-cases/RetrieveAdjustmentTransactionByIdUseCase";
import { CreateAdjustmentTransactionUseCase } from "./core/use-cases/CreateAdjustmentTransactionUseCase";
import { UpdateAdjustmentTransactionUseCase } from "./core/use-cases/UpdateAdjustmentTransactionUseCase";
import { DeleteAdjustmentTransactionUseCase } from "./core/use-cases/DeleteAdjustmentTransactionUseCase";
import axios from "axios";
import { DeleteAdjustmentTransactionBySKUUseCase } from "./core/use-cases/DeleteAdjustmentTransactionBySKUUseCase";
import { RetrieveAdjustmentTransactionBySKUUseCase } from "./core/use-cases/RetrieveAdjustmentTransactionBySKUUseCase";

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
  database: process.env.DB_NAME ? process.env.DB_NAME : "transaction_db",
});

const transactionRepository = new PostgresAdjustmentTransactionRepository(client);
const productProvider = new ProductProvider(
  axios.create({
    baseURL: `http://${process.env.PRODUCT_SERVICE}:4000`,
  })
);

export async function initConnection() {
  await client.connect();
}

export const transactionsUseCase = {
  retrieveAdjustmentTransactionList:
    new RetrieveAdjustmentTransactionListUseCase(
      transactionRepository,
      productProvider
    ),
  retrieveAdjustmentTransactionByIdUseCase:
    new RetrieveAdjustmentTransactionByIdUseCase(
      transactionRepository,
      productProvider
    ),
  retrieveAdjustmentTransactionBySKUUseCase: new RetrieveAdjustmentTransactionBySKUUseCase(transactionRepository),

  createAdjustmentTransaction: new CreateAdjustmentTransactionUseCase(
    transactionRepository
  ),
  updateAdjustmentTransaction: new UpdateAdjustmentTransactionUseCase(
    transactionRepository
  ),
  deleteAdjustmentTransaction: new DeleteAdjustmentTransactionUseCase(
    transactionRepository
  ),
  deleteAdjustmentTransactionBySKU: new DeleteAdjustmentTransactionBySKUUseCase(
    transactionRepository
  )
};
