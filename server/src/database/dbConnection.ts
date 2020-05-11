/**
 * User: abhijit.baldawa
 *
 * This module exposes 'init' method to connect mongoose client to mongodb server
 */

import mongoose from 'mongoose';

interface MongoConfig {
    dbHost: string;
    dbPort: string;
    dbName: string;
    dbUser?: string;
    dbPassword?: string;
    authSource?: string;
}

/**
 * @private
 *
 * This method accepts a config object and returns a mongodb connection URL string
 * as per mongodb guideline
 *
 * @param {MongoConfig} config This object has all the necessary details to
 *                             connect to mongodb server as configured by user
 * @returns {string} - ex: "mongodb://user:password@host:port/dbname?authSource=source"
 */
function getMongoUrlFromConfig(config: MongoConfig): string {
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
 * @param {MongoConfig} dbConfig
 * @returns {Promise<void>} If successful then resolves to undefined or rejects with error
 */
function createConnection(dbConfig: MongoConfig): Promise<void> {
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
