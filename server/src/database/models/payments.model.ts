/**
 * User: abhijit.baldawa
 *
 * This module exposes methods to perform CRUD operations on payments collection
 */

import mongoose, { Schema, Document, HookNextFunction } from 'mongoose';
import { Moment } from 'moment';
import { Contract } from './contracts.model';

// -------------------------- Define types --------------------------
type UpdateOneResult = {
    n: number;
    nModified: number;
    ok: number;
};

type UpdatePaymentStructure = {
    description?: string;
    value?: number;
    time?: Date;
};

type DeletePaymentStructure = {
    isDeleted: boolean;
};

type UpdatePaymentStruct = UpdatePaymentStructure | DeletePaymentStructure;

type NewPaymentStruct = {
    contractId: Contract['_id'];
    description: string;
    value: number;
    time: Date;
    isImported?: boolean;
};

type AggregatePaymentList = {
  sum: number;
  items: Array<PaymentStruct & {id: string}>;
};

interface PaymentStruct {
    contractId: Contract['_id'];
    description: string;
    value: number;
    time: Date;
    isImported: boolean;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

interface Payment extends PaymentStruct, Document{}
// ---------------------------------- Types End ----------------------------------

// -------------------- Define mongoose schema and create mongoose model ---------
const paymentSchema = new Schema<Payment>({
  contractId: { type: String, required: true },
  description: { type: String, required: true },
  value: { type: Number, required: true },
  time: { type: Date, required: true },
  isImported: { type: Boolean, required: false },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, required: false },
  isDeleted: { type: Boolean, required: false }
});

paymentSchema.pre<Payment>('save', function (this: Payment, next: HookNextFunction): void {
  if (this.isNew) {
    this.createdAt = new Date();
    this.isDeleted = false;
  }
  this.updatedAt = new Date();
  next();
});

paymentSchema.pre<Payment>('updateOne', function (this: Payment, next: HookNextFunction): void {
  this.set({ updatedAt: new Date() });
  next();
});

const PaymentModel = mongoose.model<Payment>('payment', paymentSchema);
// -------------------------------- END ----------------------------------------

async function createPayment(paymentObj: NewPaymentStruct): Promise<Payment> {
  return new PaymentModel(paymentObj).save();
}

async function updatePaymentById(_id: string, updatedPaymentObj: UpdatePaymentStruct): Promise<UpdateOneResult> {
  return PaymentModel.updateOne({ _id }, { $set: updatedPaymentObj });
}

async function deletePaymentById(_id: string): Promise<UpdateOneResult> {
  return updatePaymentById(_id, { isDeleted: true });
}

async function getAllPayments(): Promise<Payment[]> {
  return PaymentModel.find();
}

async function getAggregatedPaymentList(options: {contractId: string; startDate?: Moment; endDate?: Moment}): Promise<AggregatePaymentList[]> {
  const { contractId, startDate, endDate } = options;
  let matchObj: {contractId: string; isDeleted: boolean; time?: {$gte?: Date; $lte?: Date} } = { contractId, isDeleted: false };

  if (startDate || endDate) {
    matchObj.time = {};
    if (startDate) {
      matchObj.time.$gte = startDate.toDate();
    }

    if (endDate) {
      matchObj.time.$lte = endDate.toDate();
    }
  }

  return PaymentModel.aggregate<AggregatePaymentList>([
    { $match: matchObj },
    { $sort: { _id: -1 } },
    {
      $group: {
        _id: '$contractId',
        items: {
          $push: {
            id: '$_id',
            contractId: '$contractId',
            description: '$description',
            isImported: '$isImported',
            value: '$value',
            time: '$time',
            createdAt: '$createdAt',
            isDeleted: '$isDeleted',
            updatedAt: '$updatedAt'
          }
        },
        sum: {
          $sum: '$value'
        }
      }
    },
    { $project: { items: 1, _id: 0, sum: 1 } }
  ]);
}

export {
  // ---- types -----
  Payment,
  NewPaymentStruct,
  UpdateOneResult,
  UpdatePaymentStructure,
  AggregatePaymentList,
  // ------- END -------

  getAggregatedPaymentList,
  createPayment,
  updatePaymentById,
  deletePaymentById,
  getAllPayments
};
