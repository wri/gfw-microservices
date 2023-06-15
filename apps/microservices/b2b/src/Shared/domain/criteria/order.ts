import { OrderBy } from './order.by';
import { OrderType, OrderTypes } from './order.type';

export class Order {
  readonly orderBy: OrderBy;
  readonly orderType: OrderType;

  constructor(orderBy: OrderBy, orderType: OrderType) {
    this.orderBy = orderBy;
    this.orderType = orderType;
  }

  static fromValues(values: Map<string, string>): Order {
    const field = values.get('field');
    const type = values.get('type');

    if (!field || !type) {
      return Order.none();
    }

    return new Order(new OrderBy(field), OrderType.fromValue(type));
  }

  static none(): Order {
    return new Order(new OrderBy(''), new OrderType(OrderTypes.NONE));
  }

  static desc(orderBy: string): Order {
    return new Order(new OrderBy(orderBy), new OrderType(OrderTypes.DESC));
  }

  static asc(orderBy: string): Order {
    return new Order(new OrderBy(orderBy), new OrderType(OrderTypes.ASC));
  }
}
