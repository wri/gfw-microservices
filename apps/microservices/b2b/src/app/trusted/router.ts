import * as express from 'express';
import { makeValidateBody } from 'express-class-validator'

import {
  listConnection,
} from './controller'

const router = express.Router()

router.get('', 
  async (req: express.Request, res: express.Response, next: express.NextFunction ) => {
    try {
      await listConnection(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export {
  router,
}