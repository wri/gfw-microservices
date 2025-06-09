import { getConverters, stopConverter } from '../controllers/converters.controller';
import {
  checkProManagerAuthentication,
  rateLimitAuthenticated,
} from '../../../config/publicutils/middlewares';
import { useRateLimiter } from '../../../config/lib/limiter-util';

/**
 * @name exports
 * @static
 * @summary Converters Routes
 */
export default (app, limiter) => {
  const routeMiddlewares = [checkProManagerAuthentication];
  if (useRateLimiter()) {
    routeMiddlewares.push(limiter(rateLimitAuthenticated));
  }

  /**
   * @route GET /converters
   * @desc Returns a list of available converters
   * @access Pro Manager only
   */
  app.get('/converter/all', routeMiddlewares, getConverters);

  /**
   * @route POST /converter/:id/stop
   * @desc Stops execution of a specific converter by ID
   * @access Pro Manager only
   * @param {number} id - The ID of the converter
   */
  app.post('/converter/:id/stop', routeMiddlewares, stopConverter);
};
