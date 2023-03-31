type ErrorCode = 404 | 500;

class ResultError extends Error {
  public code: ErrorCode;
  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export default ResultError;
