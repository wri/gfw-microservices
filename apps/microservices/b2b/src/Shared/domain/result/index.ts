class Result<V, E> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private error: E;
  private value: V;

  private constructor(isSuccess: boolean, value: V, error: E) {
    if (isSuccess && error) {
      throw new Error("Successful result must not contain an error");
    } else if (!isSuccess && value) {
      throw new Error("Unsuccessful error must not contain a value");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.value = value;
    this.error = error;
  }

  public static ok<V>(value: V): Result<V, undefined> {
    return new Result(true, value, undefined);
  }

  public static fail<E>(error: E): Result<undefined, E> {
    return new Result(false, undefined, error);
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error("Successful result does not contain an error");
    }

    return this.error;
  }

  public getValue(): V {
    if (this.isFailure) {
      throw new Error("Unsuccessful result does not contain a value");
    }

    return this.value;
  }
}

export default Result;
