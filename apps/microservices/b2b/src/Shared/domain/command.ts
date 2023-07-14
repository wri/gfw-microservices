import ResultPromise from './result/result.promise';

export interface Command {
  execute();
  getMany<T>(): ResultPromise<T[]>;
}
