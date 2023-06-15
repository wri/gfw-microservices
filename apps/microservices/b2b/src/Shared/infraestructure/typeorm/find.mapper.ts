import { FindOperator } from 'typeorm';
import { OrderTypes } from '../../domain/criteria/order.type';
import type { Orders } from '../../domain/criteria/orders';
import { Operator } from '../../domain/criteria/filter.operator';
import type { Filter } from '../../domain/criteria/filter';
import type { Filters } from '../../domain/criteria/filters';
import type { Order } from '../../domain/criteria/order';
import type { QueryCriteria } from '../../domain/criteria/query';

type TypeORMFilterOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'like';

type TypeORMFilterValue = boolean | string | number;
type TypeORMFilterOperation = {
  [operator in TypeORMFilterOperator]?: TypeORMFilterValue;
};
type TypeORMFilter =
  | { [field: string]: TypeORMFilterOperation }
  | {
      [field: string]:
        | TypeORMFilterOperation
        | FindOperator<TypeORMFilterValue>;
    };

type TypeORMDirection = 'ASC' | 'DESC';
type TypeORMSort = { [field: string]: TypeORMDirection };

interface TypeORMQuery {
  where: TypeORMFilter;
  order: TypeORMSort;
  skip: number;
  take: number;
}

interface TransformerFunction<T, K> {
  (value: T): K;
}

export class MapperFindTypeORM {
  private ordersTransformers: Map<
    OrderTypes,
    TransformerFunction<Order, TypeORMSort>
  >;
  private filterTransformers: Map<
    Operator,
    TransformerFunction<Filter, TypeORMFilter>
  >;

  constructor() {
    this.filterTransformers = new Map<
      Operator,
      TransformerFunction<Filter, TypeORMFilter>
    >([
      [Operator.EQUAL, this.equalFilter],
      [Operator.NOT_EQUAL, this.notEqualFilter],
      [Operator.GT, this.greaterThanFilter],
      [Operator.LT, this.lowerThanFilter],
      [Operator.CONTAINS, this.containsFilter],
      [Operator.NOT_CONTAINS, this.notContainsFilter],
      [Operator.OR, this.inFilter],
    ]);

    this.ordersTransformers = new Map<
      OrderTypes,
      TransformerFunction<Order, TypeORMSort>
    >([
      [OrderTypes.ASC, this.ascSort],
      [OrderTypes.DESC, this.descSort],
    ]);
  }

  public convert(query: QueryCriteria): TypeORMQuery {
    return {
      where: query.hasFilters() ? this.generateFilter(query.filters) : {},
      order: query.hasOrder() ? this.generateSort(query.orders) : {},
      skip: query.offset || 0,
      take: query.limit || 15,
    };
  }

  protected generateFilter(filters: Filters): TypeORMFilter {
    const filter = filters.filters.map((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);

      if (!transformer) {
        throw Error(`Unexpected operator value ${filter.operator.value}`);
      }

      return transformer(filter);
    });

    return Object.assign({}, ...filter);
  }

  protected generateSort(orders: Orders): TypeORMSort {
    const sort = orders.orders.map((order) => {
      const transformer = this.ordersTransformers.get(order.orderType.value);

      if (!transformer) {
        throw Error(`Unexpected direction value ${order.orderType.value}`);
      }

      return transformer(order);
    });

    return Object.assign({}, ...sort);
  }

  private ascSort(order: Order): TypeORMSort {
    return { [order.orderBy.value]: 'ASC' };
  }

  private descSort(order: Order): TypeORMSort {
    return { [order.orderBy.value]: 'DESC' };
  }

  private inFilter(filter: Filter): TypeORMFilter {
    return { [filter.field.value]: new FindOperator('in', filter.value.value) };
  }

  private equalFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator('equal', filter.value.value),
    };
  }

  private notEqualFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator('not', filter.value.value),
    };
  }

  private greaterThanFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator('moreThan', filter.value.value),
    };
  }

  private lowerThanFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator('lessThan', filter.value.value),
    };
  }

  private containsFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator('like', `%${filter.value.value}%`),
    };
  }

  private notContainsFilter(filter: Filter): TypeORMFilter {
    return {
      [filter.field.value]: new FindOperator(
        'ilike',
        `%${filter.value.value}%`,
      ),
    };
  }
}
