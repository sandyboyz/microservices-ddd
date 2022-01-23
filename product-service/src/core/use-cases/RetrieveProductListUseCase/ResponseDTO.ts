import { JSONProductProps } from "../../serializers/JSONProductSerializer";

export interface RetrieveProductListResponseDTO {
  totalData: number;
  page: number;
  totalPage: number;
  data: JSONProductProps[];
}
