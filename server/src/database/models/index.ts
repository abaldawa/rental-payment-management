/**
 * User: abhijit.baldawa
 *
 * This module initializes all db models
 */
import sampleContractsData from '../sampleData/contracts.json';
import * as contractsModel from './contracts.model';
import logger from '../../logger/logger';
import { formatPromiseResult } from '../../utils/util';

export default async (): Promise<void> => {
  let err;
  let totalContracts: number | undefined;

  // ------------------------- 1. Get total contracts count from DB -----------------------------------------
  [err, totalContracts] = await formatPromiseResult<Error, number>(contractsModel.totalContractsCount());

  if (err) {
    logger.error(`Error fetching contracts count from 'contracts' collection. Error: ${err.stack || err}`);
    throw err;
  }
  // -------------------------------------- 1. END ----------------------------------------------------------


  // ----------------- 2. Populate 'contracts' collection with dummy contracts if empty ----------------------------
  if (!totalContracts) {
    logger.info(`'contracts' collection looks empty. Populating it with dummy data from 'rental-contracts-management/server/src/database/sampleData/contracts.json`);

    [err] = await formatPromiseResult<Error, contractsModel.Contract[]>((contractsModel.insertAllContracts(sampleContractsData)));

    if (err) {
      logger.error(`Error inserting dummy contracts in DB. Error: ${err.stack || err}`);
      throw err;
    }

    logger.info(`Successfully populated 'contracts' collection with dummy contracts`);
  }
  // ------------------------------------------ 2. END ------------------------------------------------------
};
