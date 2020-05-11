/**
 * User: abhijit.baldawa
 *
 * This module exposes methods to perform CRUD operations on contracts collection
 */

import mongoose, { Schema, Document } from 'mongoose';

interface ContractStruct {
    details: string;
    address: string;
}

interface Contract extends ContractStruct, Document {}

const contractSchema = new Schema<Contract>({
  details: { type: String, required: true },
  address: { type: String, required: true }
});

const ContractModel = mongoose.model<Contract>('contract', contractSchema);

function insertAllContracts(contracts: ContractStruct[]): Promise<Contract[]> {
  return ContractModel.insertMany(contracts);
}

async function getAllContracts(): Promise<Contract[]> {
  return ContractModel.find();
}

async function getContractById(_id: string): Promise <Contract | null> {
  return ContractModel.findById(_id);
}

async function totalContractsCount(): Promise<number> {
  return ContractModel.estimatedDocumentCount();
}

export {
  Contract,
  getContractById,
  insertAllContracts,
  totalContractsCount,
  getAllContracts
};
