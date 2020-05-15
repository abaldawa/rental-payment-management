/**
 * User: abhijit.baldawa
 *
 * This module exposes 'init' method to connect mongoose client to mongodb server
 */

import mongoose from 'mongoose';
import { MongoDbConfigStruct } from '../config/config';

/**
 * @private
 *
 * This method accepts a config object and returns a mongodb connection URL string
 * as per mongodb guideline
 *
 * @param {MongoDbConfigStruct} config This object has all the necessary details to
 *                             connect to mongodb server as configured by user
 * @returns {string} - ex: "mongodb://user:password@host:port/dbname?authSource=source"
 */
function getMongoUrlFromConfig(config: MongoDbConfigStruct): string {
  let
    adminAuthSource;
  let URL = 'mongodb://';

  if (config.dbUser && config.dbPassword && config.authSource) {
    URL = `${URL}${config.dbUser}:${config.dbPassword}@`;
    adminAuthSource = `?authSource=${config.authSource}`;
  }

  URL = `${URL}${config.dbHost}:${config.dbPort}/${config.dbName}`;

  if (adminAuthSource) {
    URL = `${URL}${adminAuthSource}`;
  }
  return URL;
}

/**
 * @public
 *
 * This method connects mongoose to mongoDB server
 *
 * @param {MongoDbConfigStruct} dbConfig
 * @returns {Promise<void>} If successful then resolves to undefined or rejects with error
 */
function createConnection(dbConfig: MongoDbConfigStruct): Promise<void> {
  const
    URL = getMongoUrlFromConfig(dbConfig);

  mongoose.connect(URL, { useNewUrlParser: true });

  return new Promise((resolve, reject) => {
    mongoose.connection
      .on('error', reject)
      .once('open', resolve);
  });
}

export {
  createConnection
};
