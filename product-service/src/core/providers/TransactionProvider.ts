import axios, { Axios } from "axios";

export interface JSONAdjustmentTransactionResponse {
    id: string;
    sku: string;
    quantity: number;
    amount?: number;
    createdAt: Date;
  }

  
export class TransactionProvider {
  constructor(private client: Axios) {}


  public async getTransactions(sku: string): Promise<JSONAdjustmentTransactionResponse[]> {
      const response = await this.client.get(`/transactions/sku/${sku}`);

      return response.data.data;
  }

  public async insertTransaction(sku: string, quantity: number): Promise<void> {
    await this.client.post("/transactions", {
      sku,
      quantity,
    });
  }

  public async deleteTransactionBySKU(sku: string): Promise<void> {
    await this.client.delete(`/transactions/sku/${sku}`);
  }
}
