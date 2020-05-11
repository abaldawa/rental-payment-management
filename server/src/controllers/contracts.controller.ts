/**
 * User: abhijit.baldawa
 *
 * This is controller module for /contracts route
 */

import { Context } from 'koa';
import moment from 'moment';
import logger from '../logger/logger';
import * as contractsModel from '../database/models/contracts.model';
import * as paymentModel from '../database/models/payments.model';
import { formatPromiseResult } from '../utils/util';

/**
 * @public
 *
 * GET /contracts
 * This method gets all contracs from the DB
 *
 * @param {Context} ctx - koa context object
 */
async function getAllContracts(ctx: Context): Promise<void> {
  const [err, contracts] = await formatPromiseResult<Error, contractsModel.Contract[]>(contractsModel.getAllContracts());

  if (err) {
    logger.error(`Error while reading meter readings from the DB. Error: ${err.stack || err}`);
    return ctx.throw(500, err);
  }

  ctx.body = contracts;
}

/**
 * @public
 *
 * POST /contracts/:contractId
 * This method adds new payment to and existing contract
 *
 * @param {Context} ctx - koa context object
 */
async function addPayment(ctx: Context): Promise<void> {
  const { contractId } = ctx.params as {contractId: string};
  const {
    description, time, value, isImported = false
  } = ctx.request.body as paymentModel.NewPaymentStruct || {};
  const paymentTime = moment(time, moment.ISO_8601, true);

  let err;
  let createdPayment: paymentModel.Payment | undefined;
  let foundContract: contractsModel.Contract | null | undefined;

  if (
    !description
    || typeof isImported !== 'boolean'
    || !time
    || typeof value !== 'number'
  ) {
    return ctx.throw(400, `Payment body should have atleast 'description', 'value' = 'as number' and 'time'`);
  }

  if (!paymentTime.isValid()) {
    return ctx.throw(400, `'time' inside payment body is not valid`);
  }

  // ----------------------------------- 1. Check if contractId exists in DB --------------------------------
  [err, foundContract] = await formatPromiseResult<Error, contractsModel.Contract | null>(
    contractsModel.getContractById(contractId)
  );

  if (err) {
    logger.error(`Error while querying contractId = '${contractId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while querying contractId = '${contractId}' from database. Error: ${err}`);
  }

  if (!foundContract) {
    return ctx.throw(404, `contractId = '${contractId}' not found in database`);
  }
  // ------------------------------------------------ 1. END ------------------------------------------------


  // --------------------------------- 2. contractId exists so create payment -------------------------------
  [err, createdPayment] = await formatPromiseResult<Error, paymentModel.Payment>(
    paymentModel.createPayment({
      contractId, description, isImported, value, time: paymentTime.toDate()
    })
  );

  if (err) {
    logger.error(`Error creating payment for contractId = ${contractId}. Error = ${err.stack || err}`);
    return ctx.throw(500, `Error creating payment for contractId = ${contractId}. Error = ${err}`);
  }
  // -------------------------------------------------- 2. END ----------------------------------------------

  ctx.status = 201;
  ctx.body = createdPayment;
}


/**
 * @public
 *
 * DELETE /contracts/:contractId/payments/:paymentId
 * This method deletes an existing payment of a contract from the DB
 *
 * @param {Context} ctx - koa context object
 */
async function deletePayment(ctx: Context): Promise<void> {
  const { contractId, paymentId } = ctx.params as {contractId: string; paymentId: string};

  let err;
  let deletePaymentRes: paymentModel.UpdateOneResult | undefined;
  let foundContract: contractsModel.Contract | null | undefined;

  // ----------------------------------- 1. Check if contractId exists in DB --------------------------------
  [err, foundContract] = await formatPromiseResult<Error, contractsModel.Contract | null>(
    contractsModel.getContractById(contractId)
  );

  if (err) {
    logger.error(`Error while querying contractId = '${contractId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while querying contractId = '${contractId}' from database. Error: ${err}`);
  }

  if (!foundContract) {
    return ctx.throw(404, `contractId = '${contractId}' not found in database`);
  }
  // ------------------------------------------------ 1. END ------------------------------------------------

  // ------------------------------ 2. Soft delete paymentId from the dabase -------------------------------
  [err, deletePaymentRes] = await formatPromiseResult<Error, paymentModel.UpdateOneResult>(
    paymentModel.deletePaymentById(paymentId)
  );

  if (err) {
    logger.error(`Error while deleting paymentId = '${paymentId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while deleting paymentId = '${paymentId}' from database. Error: ${err}`);
  }

  if (!deletePaymentRes?.nModified) {
    return ctx.throw(404, `paymentId = '${paymentId}' not found in the database`);
  }
  // ------------------------------------------------ 2. END ------------------------------------------------

  ctx.status = 200;
  ctx.body = `Deleted paymentId = '${paymentId}'`;
}

/**
 * @public
 *
 * PUT /contracts/:contractId/payments/:paymentId
 * This method updates an existing payment of a contract in the DB
 *
 * @param {Context} ctx - koa context object
 */
async function modifyPayment(ctx: Context): Promise<void> {
  const { contractId, paymentId } = ctx.params as {contractId: string; paymentId: string};
  const { description, value, time } = ctx.request.body as paymentModel.UpdatePaymentStructure;
  const updatedPaymentTime = moment(time, moment.ISO_8601, true);

  let err;
  let updatedPaymentRes: paymentModel.UpdateOneResult | undefined;
  let foundContract: contractsModel.Contract | null | undefined;

  if (!description && typeof value !== 'number' && !time) {
    return ctx.throw(400, `Atleast 'description' or 'value' = 'as number' or 'time' is required in request body`);
  }

  if (time && !updatedPaymentTime.isValid()) {
    return ctx.throw(400, `Invalid 'time' passed in the request body`);
  }

  // ----------------------------------- 1. Check if contractId exists in DB --------------------------------
  [err, foundContract] = await formatPromiseResult<Error, contractsModel.Contract | null>(
    contractsModel.getContractById(contractId)
  );

  if (err) {
    logger.error(`Error while querying contractId = '${contractId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while querying contractId = '${contractId}' from database. Error: ${err}`);
  }

  if (!foundContract) {
    return ctx.throw(404, `contractId = '${contractId}' not found in database`);
  }
  // ------------------------------------------------ 1. END ------------------------------------------------

  // --------------------------- 2. Update payment of a contract by paymentId --------------------------------
  [err, updatedPaymentRes] = await formatPromiseResult<Error, paymentModel.UpdateOneResult>(
    paymentModel.updatePaymentById(paymentId, { description, value, time: updatedPaymentTime.toDate() })
  );

  if (err) {
    logger.error(`Error while updating payment info for paymentId = '${paymentId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while updating payment info for paymentId = '${paymentId}' from database. Error: ${err}`);
  }

  if (!updatedPaymentRes?.nModified) {
    return ctx.throw(404, `paymentId = '${paymentId}' not found in the database`);
  }
  // ---------------------------------------------- 2. END ------------------------------------------------------

  ctx.status = 200;
  ctx.body = `Updated payment information for '${paymentId}'`;
}

/**
 * @public
 *
 * GET /contracts/:contractId/paymentList
 * This method gets an aggregate of all the non deleted payments along with
 * cumulative sum
 *
 * Output response is as below:
 * {
 *   sum: number,
 *   items: [
 *     {
 *       id: string,
 *       contractId: number,
 *       description: string,
 *       value: number,
 *       time: Date,
 *       isImported: boolean,
 *       createdAt: Date,
 *       updatedAt: Date,
 *       isDeleted: boolean
 *     },
 *     ...
 *   ]
 * }
 *
 * @param {Context} ctx - koa context object
 */
async function getPaymentListByContractId(ctx: Context): Promise<void> {
  const { contractId } = ctx.params as {contractId: string};
  const { startDate: startDateIsoStr, endDate: endDateIsoStr } = ctx.query as {startDate?: string; endDate?: string};

  let startDate: moment.Moment | undefined;
  let endDate: moment.Moment | undefined;
  let paymentList: paymentModel.AggregatePaymentList[] | undefined;
  let foundContract: contractsModel.Contract | null | undefined;
  let err;

  // --------------------------------------- 1. Validate inputs ----------------------------------------------
  if (startDateIsoStr) {
    startDate = moment(startDateIsoStr, moment.ISO_8601, true);

    if (!startDate.isValid()) {
      return ctx.throw(400, `'startDate' query param must be an ISO date string`);
    }
  }

  if (endDateIsoStr) {
    endDate = moment(endDateIsoStr, moment.ISO_8601, true);

    if (!endDate.isValid()) {
      return ctx.throw(400, `'endDate' query param must be an ISO date string`);
    }
  }

  if (startDate && endDate && !startDate.isBefore(endDate)) {
    return ctx.throw(400, `'endDate' must be after 'startDate'`);
  }
  // ---------------------------------------------- 1. END --------------------------------------------------

  // ----------------------------------- 2. Check if contractId exists in DB --------------------------------
  [err, foundContract] = await formatPromiseResult<Error, contractsModel.Contract | null>(
    contractsModel.getContractById(contractId)
  );

  if (err) {
    logger.error(`Error while querying contractId = '${contractId}' from database. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error while querying contractId = '${contractId}' from database. Error: ${err}`);
  }

  if (!foundContract) {
    return ctx.throw(404, `contractId = '${contractId}' not found in database`);
  }
  // ------------------------------------------------ 2. END ------------------------------------------------


  // ------------------------- 3. get paymentList for 'contractId' ------------------------------------------
  [err, paymentList] = await formatPromiseResult<Error, paymentModel.AggregatePaymentList[]>(
    paymentModel.getAggregatedPaymentList({ contractId, startDate, endDate })
  );

  if (err) {
    logger.error(`Error in 'paymentModel.getAggregatedPaymentList' for contractId = '${contractId}'. Error: ${err.stack || err}`);
    return ctx.throw(500, `Error getting payment list for contractId = '${contractId}'. Error: ${err}`);
  }
  // --------------------------------------- 3. END ---------------------------------------------------------

  ctx.status = 200;
  ctx.body = paymentList?.[0] || {};
}

export {
  getAllContracts,
  addPayment,
  deletePayment,
  modifyPayment,
  getPaymentListByContractId
};
