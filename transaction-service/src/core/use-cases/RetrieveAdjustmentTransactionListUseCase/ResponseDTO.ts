import { JSONAdjustmentTransactionProps } from "../../serializers/JSONAdjustmentTransactionSerializer";

export interface RetrieveAdjustmentTransactionListResponseDTO {
  totalData: number;
  page: number;
  totalPage: number;
  data: JSONAdjustmentTransactionProps[];
}
