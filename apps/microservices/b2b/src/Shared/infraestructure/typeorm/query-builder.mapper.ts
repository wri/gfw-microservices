import { SelectQueryBuilder } from 'typeorm';
import { OrderTypes } from '../../domain/criteria/order.type';
import type { Orders } from '../../domain/criteria/orders';
import { Operator } from '../../domain/criteria/filter.operator';
import type { Filter } from '../../domain/criteria/filter';
import type { Filters } from '../../domain/criteria/filters';
import type { Order } from '../../domain/criteria/order';
import type { QueryCriteria } from '../../domain/criteria/query';

interface TransformerFunction<K, T> {
  (qb: SelectQueryBuilder<K>, value: T): void;
}

export class MapperQueryTypeORM<T> {
  private ordersTransformers: Map<OrderTypes, TransformerFunction<T, Order>>;
  private filterTransformers: Map<Operator, TransformerFunction<T, Filter>>;

  constructor() {
    this.filterTransformers = new Map<Operator, TransformerFunction<T, Filter>>(
      [
        [Operator.EQUAL, this.equalFilter],
        [Operator.NOT_EQUAL, this.notEqualFilter],
        [Operator.GT, this.greaterThanFilter],
        [Operator.LT, this.lowerThanFilter],
        [Operator.CONTAINS, this.containsFilter],
        [Operator.NOT_CONTAINS, this.notContainsFilter],
        [Operator.OR, this.inFilter],
      ],
    );

    this.ordersTransformers = new Map<
      OrderTypes,
      TransformerFunction<T, Order>
    >([
      [OrderTypes.ASC, this.ascSort],
      [OrderTypes.DESC, this.descSort],
    ]);
  }

  public convert(
    query: QueryCriteria,
    qb: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> {
    if (query.hasFilters()) {
      this.applyFilters(qb, query.filters);
    }

    if (query.hasOrder()) {
      this.applyOrders(qb, query.orders);
    }

    qb.skip(query.offset || 0).take(query.limit || 15);

    return qb;
  }

  protected applyFilters(qb: SelectQueryBuilder<T>, filters: Filters): void {
    filters.filters.forEach((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);

      if (!transformer) {
        throw Error(`Unexpected operator value ${filter.operator}`);
      }

      transformer(qb, filter);
    });
  }

  protected applyOrders(qb: SelectQueryBuilder<T>, orders: Orders): void {
    orders.orders.forEach((order) => {
      const transformer = this.ordersTransformers.get(order.orderType.value);

      if (!transformer) {
        throw Error(`Unexpected direction value ${order.orderType}`);
      }

      transformer(qb, order);
    });
  }

  private ascSort(qb: SelectQueryBuilder<T>, order: Order): void {
    qb.addOrderBy(order.orderBy.value, 'ASC');
  }

  private descSort(qb: SelectQueryBuilder<T>, order: Order): void {
    qb.addOrderBy(order.orderBy.value, 'DESC');
  }

  private inFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} IN (:...${filter.field.value})`, {
      [filter.field.value]: filter.value.value,
    });
  }

  private equalFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} = :${filter.field.value}`, {
      [filter.field.value]: filter.value.value,
    });
  }

  private notEqualFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} != :${filter.field.value}`, {
      [filter.field.value]: filter.value.value,
    });
  }

  private greaterThanFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} > :${filter.field.value}`, {
      [filter.field.value]: filter.value.value,
    });
  }

  private lowerThanFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} < :${filter.field.value}`, {
      [filter.field.value]: filter.value.value,
    });
  }

  private containsFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} LIKE :${filter.field.value}`, {
      [filter.field.value]: `%${filter.value.value}%`,
    });
  }

  private notContainsFilter(qb: SelectQueryBuilder<T>, filter: Filter): void {
    qb.andWhere(`${filter.field.value} NOT LIKE :${filter.field.value}`, {
      [filter.field.value]: `%${filter.value.value}%`,
    });
  }
}
