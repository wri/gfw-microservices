import ResultError from './result/result.error';

export const ERRORS = {
  HAS_NOT_CONNECTIONS_WITH_COMPANY: new ResultError(
    'Has not connections with company',
    404,
  ),
  METHOD_NOT_IMPLEMENTED: new ResultError(
    'Method not implemented',
    500,
  ),
  NOT_ELEMENTS_FOUND: new ResultError(
    'Elements not found',
    404,
  ),
  BAD_REQUEST: new ResultError(
    'Bad Request',
    400,
  ),
};
