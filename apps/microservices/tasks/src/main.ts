/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { logger, errorHandler } from '@wri-monorepos/util'

import { start } from './app/create';

const app = express();

app.use(errorHandler);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to microservices/tasks!' });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  start();
  logger.info(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
