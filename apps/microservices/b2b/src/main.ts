/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { json } from 'body-parser'

import { logger, errorHandler } from '@wri-monorepos/util';

import { router as pendingRouter }  from './app/pending';
import { router as trustedRouter } from './app/trusted';

const app = express();

app.use(errorHandler);
app.use(json())

app.use('/pending', pendingRouter)
app.use('/trusted', trustedRouter)

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/pending`);
});
server.on('error', console.error);
