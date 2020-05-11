
/**
 * User: abhijit.baldawa
 *
 * This module initializes all the pre-requisites and then starts the koa server
 */

import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import logger from './logger/logger';
import { createConnection } from './database/dbConnection';
import initDBModels from './database/models';
import contractsRouter from './routes/contracts.routes';
import { responseTimeLoggerMiddleware } from './middlewares';
import { formatPromiseResult } from './utils/util';
import { getPort, getMongoDbConfig } from './config/config';

/**
 * Immediately invoking async method which does all the standard server startup routine.
 */
(async () => {
  const server = new Koa();
  const PORT: number = getPort();
  const mongoDbConfig = getMongoDbConfig();

  let err;

  if (!PORT) {
    logger.error('Cannot start server as port information is missing');
    process.exit(1);
  }

  // --------------------- 1. Add all the required koa middleware and routes---------------------
  server.use(koaBodyParser());
  server.use(responseTimeLoggerMiddleware);
  server.use(contractsRouter.routes()); // "/contracts" routes
  // ----------------------------------- 1. END -------------------------------------------------


  // ----------------------- 2. initialize database connection -------------------------------------
  [err] = await formatPromiseResult<Error, void>(createConnection(mongoDbConfig));

  if (err) {
    logger.error(`Failed to connect to Mongo DB database. Error: ${err.stack || err}. Stopping server...`);
    process.exit(1);
  }

  logger.info('Connected to MongoDB database.');
  // ----------------------------------- 2. END ----------------------------------------------------


  // -------------------- 3. Initialize DB models with db connection --------------------
  [err] = await formatPromiseResult<Error, void>(initDBModels());

  if (err) {
    logger.error(`Error initializing DB models. Error: ${err.stack || err}. Stopping the server`);
    process.exit(1);
  }
  // -------------------------------------- 3. END --------------------------------------


  // ------------------------------ 3. Start Http Server -------------------------------------------
  [err] = await formatPromiseResult<Error, undefined>(
    new Promise((resolve, reject) => {
      server.listen(PORT, () => {
        resolve();
      }).on('error', (httpError) => {
        reject(httpError);
      });
    })
  );

  if (err) {
    logger.error(`Error while starting server on port = ${PORT}. Error: ${err.stack || err}. Exiting...`);
    process.exit(1);
  }

  logger.info(`Server is listening on port = ${PORT}`);
  // --------------------------------- 3. END -------------------------------------------------------
})();
