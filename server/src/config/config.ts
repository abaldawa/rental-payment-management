/**
 * User: abhijit.baldawa
 *
 * This module exposes methods to fetch environment variables, process arguments and
 * configuration values from json file.
 */

import { httpServer, mongodbConfig } from './serverConfig.json';

type MongoDbConfigStruct = {
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  authSource: string;
};

/**
 * @public
 *
 * This method returns the port number on which the server should run
 *
 * @returns {number}
 */
function getPort(): number {
  if (process.env.PORT) {
    return +process.env.PORT;
  }
  return httpServer.port;
}

/**
 * @public
 *
 * Getter method for mongo DB config
 *
 * @returns {MongoDbConfigStruct}
 */
function getMongoDbConfig(): MongoDbConfigStruct {
  return mongodbConfig;
}

export {
  getPort,
  getMongoDbConfig
};
