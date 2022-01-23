import { Axios } from "axios";
import xml2js from "xml2js";
import { Product } from "../domains/Product";

const parseStringPromise = xml2js.parseStringPromise;

export class EleveniaProvider {
  constructor(private client: Axios) {}

  private toProduct(elevania: any): Product {
    const product = Product.create({
      name: elevania?.prdNm?.[0],
      sku: elevania?.sellerPrdCd?.[0].replace(/\//g, ""),
      image: elevania?.prdImage01?.[0] || '',
      price: elevania?.selPrc?.[0],
      stock: elevania?.prdSelQty?.[0],
      description: elevania?.htmlDetail?.[0],
    });

    if (product.isFailure) {
      throw new Error(product.error as string);
    }

    return product.getValue();
  }

  public async getProducts(): Promise<Product[]> {
    const response = await this.client.get("/product/listing");

    const result = await parseStringPromise(response.data);

    const data = result.Products.product;

    const products = data.map(this.toProduct);

    return products;
  }
}
