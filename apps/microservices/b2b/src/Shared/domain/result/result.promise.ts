import type Result from '.';
import type ResultError from './result.error';

type ResultPromise<M> = Promise<Result<M | undefined, ResultError | undefined>>;

export default ResultPromise;
