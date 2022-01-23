import { StaticImplements } from "../../shared/decorators/StaticImplements";
import { Mapper } from "../../shared/core/Mapper";
import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";
import { Product } from "../domains/Product";

export interface PostgresProductProps {
  id: string;

  name: string;
  sku: string;
  image: string;
  price: number;

  description?: string;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

@StaticImplements<Mapper<Product, PostgresProductProps>>()
export class PostgresProductMapper {
  public static toDomain(props: PostgresProductProps): Product {
    const productOrError = Product.create(
      {
        name: props.name,
        sku: props.sku,
        image: props.image,
        price: props.price,
        description: props.description ? props.description : undefined,
        createdAt: props.created_at,
        updatedAt: props.updated_at,
        deletedAt: props.deleted_at,
      },
      new UniqueEntityID(props.id)
    );

    if (productOrError.isFailure) {
      throw productOrError.errorValue();
    } else {
      return productOrError.getValue();
    }
  }

  public static toPersistence(domain: Product): PostgresProductProps {
    return {
      id: domain.id.toString(),
      name: domain.name,
      sku: domain.sku,
      image: domain.image,
      price: domain.price,
      description: domain.description ? domain.description : undefined,

      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
      deleted_at: domain.deletedAt,
    };
  }
}
