/**
 * This file loads the environment variables on setup
 */
import { config } from 'dotenv';
config({
  path: __dirname + '/.env',
});
