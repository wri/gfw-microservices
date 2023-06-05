import { Filter } from "./filter";

export class Filters {
  filters: Filter[];

  constructor(filters: Filter[]) {
    this.filters = filters;
  }

  static fromValues(filters: Array<Map<string, string>>): Filters {
    return new Filters(filters.map(Filter.fromValues));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  addFilter(filter: Object): void {
    const filterMap = new Map(Object.entries(filter));
    console.log(filterMap)
    this.filters.push(Filter.fromValues(filterMap));
  }

  static none(): Filters {
    return new Filters([]);
  }
}
