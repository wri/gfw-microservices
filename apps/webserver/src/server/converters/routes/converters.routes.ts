import { Application, RequestHandler } from 'express';
import { getConverters, startConverter, stopConverter } from '../controllers/converters.controller';

import {
  checkProManagerAuthentication,
  rateLimitAuthenticated,
} from '../../../config/publicutils/middlewares';
import { useRateLimiter } from '../../../config/lib/limiter-util';

export default function converterRoutes(app: Application, limiter: (opts: any) => RequestHandler) {
  const routeMiddlewares: RequestHandler[] = [checkProManagerAuthentication];

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
   * @route POST /converter/start
   * @desc Starts a specific converter by name
   * @access Pro Manager only
   */
  app.post('/converter/start', routeMiddlewares, startConverter);

  /**
   * @route POST /converter/:id/stop
   * @desc Stops execution of a specific converter by ID
   * @param {number} id - The ID of the converter
   * @access Pro Manager only
   */
  app.post('/converter/:id/stop', routeMiddlewares, stopConverter);
}
