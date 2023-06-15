import { Order } from './order';

export class Orders {
  readonly orders: Order[];

  constructor(orders: Order[]) {
    this.orders = orders;
  }

  static fromValues(orders: Array<Map<string, string>>): Orders {
    return new Orders(orders.map(Order.fromValues));
  }

  static none(): Orders {
    return new Orders([]);
  }
}
