import * as express from 'express';
import { makeValidateBody } from 'express-class-validator'

import { 
    CreatePendingConnectionRequest, 
    ChangeStatusPendingConnectionRequest 
} from '@wri-monorepos/sql';

import {
  acceptConnection,
  listConnection,
  addConnection,
  rejectConnection
} from './controller'

const router = express.Router()

router.post('', 
  makeValidateBody(CreatePendingConnectionRequest),
  async (req: express.Request, res: express.Response, next: express.NextFunction ) => {
    try {
      await addConnection(req, res);
    } catch (err) {
      next(err);
    }
  }
)

router.get('', 
  async (req: express.Request, res: express.Response, next: express.NextFunction ) => {
    try {
      await listConnection(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/accept',
  makeValidateBody(ChangeStatusPendingConnectionRequest),
  async (req: express.Request, res: express.Response, next: express.NextFunction ) => {
    try {
      await acceptConnection(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/reject',
  makeValidateBody(ChangeStatusPendingConnectionRequest),
  async (req: express.Request, res: express.Response, next: express.NextFunction ) => {
    try {
      await rejectConnection(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export {
  router,
}