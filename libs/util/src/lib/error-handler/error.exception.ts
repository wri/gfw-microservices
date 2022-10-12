import { ErrorCode } from './error.code';
import { ErrorMessage } from './error.message';



export class ErrorException extends Error {
  
  public status: number = undefined;
  public metaData: ErrorMessage = undefined;

  constructor(errorCode: string = ErrorCode.InternalServerError, metaData: ErrorMessage = undefined) {
    super(errorCode);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = errorCode;
    this.metaData = metaData;
    
    switch (errorCode) {
      case ErrorCode.OK:
        this.status = 200;
        break;
      case ErrorCode.Created:
        this.status = 201;
        break;
      case ErrorCode.BadRequest:
        this.status = 400;
        break;
      case ErrorCode.Unauthorized:
        this.status = 401;
        break;
      case ErrorCode.Forbidden:
        this.status = 403;
        break;
      case ErrorCode.NotFound:
        this.status = 404;
        break;
      case ErrorCode.InternalServerError:
        this.status = 500;
        break;
      case ErrorCode.NotImplemented:
        this.status = 501;
        break;
      case ErrorCode.BadGateway:
        this.status = 502;
        break;        
      case ErrorCode.ServiceUnavailable:
        this.status = 503;
        break;        
      default:
        this.status = 500;
        break;
    }
  }
}