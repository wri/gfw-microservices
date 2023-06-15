import { Filters } from './filters';
import { Orders } from './orders';

export type FilterType = { value: string; operator: string; field: string };
export type OrderType = { by: string; type: string };

export class QueryCriteria {
  readonly filters: Filters;
  readonly orders: Orders;
  readonly limit?: number | undefined;
  readonly offset?: number | undefined;

  constructor(
    filters: Array<FilterType>,
    orders: Array<OrderType>,
    limit?: number,
    offset?: number,
  ) {
    this.filters = Filters.fromValues(this.parseFilters(filters));
    this.orders = Orders.fromValues(this.parseOrders(orders));
    this.limit = limit;
    this.offset = offset;
  }

  public hasFilters(): boolean {
    return this.filters.filters.length > 0;
  }

  public hasOrder(): boolean {
    return this.orders.orders.length > 0;
  }

  parseFilters(params: Array<FilterType>): Array<Map<string, string>> {
    if (!params) {
      return new Array<Map<string, string>>();
    }

    return params.map((filter) => {
      const field = filter.field;
      const value = filter.value;
      const operator = filter.operator;

      return new Map([
        ['field', field],
        ['operator', operator],
        ['value', value],
      ]);
    });
  }

  parseOrders(params?: Array<OrderType>): Array<Map<string, string>> {
    if (!params) {
      return new Array<Map<string, string>>();
    }

    return params.map((order) => {
      const field = order.by;
      const type = order.type;

      return new Map([
        ['field', field],
        ['type', type],
      ]);
    });
  }
}
