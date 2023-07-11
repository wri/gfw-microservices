import ResultPromise from './result/result.promise';

export interface Command {
  getOne<T>(): ResultPromise<T>;
  execute();
  getMany<T>(): ResultPromise<T[]>;
}
