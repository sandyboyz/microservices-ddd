import joi from 'joi';
import {Entity} from '../../shared/domain/Entity';
import {UniqueEntityID} from '../../shared/domain/UniqueEntityID';
import {Guard} from '../../shared/core/Guard';
import {Result} from '../../shared/core/Result';

export interface ProductProps {
  name: string;
  sku: string;
  image: string;
  price: number;

  description?: string;
  stock?: number;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Product extends Entity<ProductProps> {
  private static SCHEMA = joi.object<ProductProps>({
    name: joi.string().required(),
    sku: joi.string().required(),
    image: joi.string().allow('').required(),
    price: joi.number().required(),

    description: joi.string().allow("").optional(),
    stock: joi.number().optional(),

    createdAt: joi.date().optional(),
    updatedAt: joi.date().optional(),
    deletedAt: joi.date().allow(null).optional(),
  }).required();

  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): string  {
    return this.props.sku;
  }

  get image(): string {
    return this.props.image;
  }

  get price(): number {
    return this.props.price;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get stock(): number | undefined {
    return this.props.stock;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }
  

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  isStockDefined(): boolean {
    return this.props.stock !== undefined;
  }

  setStock(stock: number): Result<void> {
    this.props.stock = stock;
    return Result.ok();
  }

  setName(name: string): Result<void> {
    this.props.name = name;
    return Result.ok();
  }

  setSku(sku: string): Result<void> {
    this.props.sku = sku;
    return Result.ok();
  }

  setImage(image: string): Result<void> {
    this.props.image = image;
    return Result.ok();
  }

  setPrice(price: number): Result<void> {
    this.props.price = price;
    return Result.ok();
  }

  setDescription(description: string): Result<void> {
    this.props.description = description;
    return Result.ok();
  }


  public static create(
    props: ProductProps,
    id?: UniqueEntityID,
  ): Result<Product> {
    const guardResult = Guard.againstSchema<ProductProps>(this.SCHEMA, props);
    if (!guardResult.succeeded) {
      return Result.fail(
        guardResult.message!
      );
    } else {
      props = guardResult.value!;
      const product = new Product(
        {
          ...props,
          createdAt: props.createdAt ? props.createdAt : new Date(),
          updatedAt: props.updatedAt ? props.updatedAt : new Date(),
        },
        id,
      );

      return Result.ok(product);
    }
  }
}
