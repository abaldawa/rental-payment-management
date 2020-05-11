/**
 * User: abhijit.baldawa
 *
 * This module contains all the routes for "/contracts" endpoints
 */

import Router from 'koa-router';
import * as contracts from '../controllers/contracts.controller';

const router = new Router({
  prefix: '/contracts'
});

router.get('/', contracts.getAllContracts);
router.post('/:contractId', contracts.addPayment);
router.delete('/:contractId/payments/:paymentId', contracts.deletePayment);
router.put('/:contractId/payments/:paymentId', contracts.modifyPayment);
router.get('/:contractId/paymentList', contracts.getPaymentListByContractId);

export default router;
