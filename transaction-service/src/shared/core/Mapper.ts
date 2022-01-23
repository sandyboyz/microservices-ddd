export abstract class Mapper<TDomain, TPersistence> {
  public abstract toDomain(raw: TPersistence): TDomain;
  public abstract toPersistence(domain: TDomain): TPersistence;
}
