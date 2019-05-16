import { Address, EthereumCall } from '@graphprotocol/graph-ts';
import {
  CashoutCall,
  ReplyCall,
  SetIsActiveCall,
  SetNewAddressCall,
  TransferOwnershipCall,
} from '../generated/Contract/Contract';
import { Account, DebugEvent } from '../generated/schema';

export function createDebugEvent(
  call: EthereumCall,
  fn: string,
  message: string | null,
  ipfsHash: string | null,
  account2: Address | null
): void {
  let evt = new DebugEvent(call.transaction.hash.toHex());
  evt.fn = fn;
  evt.block = call.block.number.toI32();
  evt.tx = call.transaction.hash;
  evt.from = call.transaction.from;
  evt.timestamp = call.block.timestamp.toI32();

  evt.message = message;
  evt.ipfsHash = ipfsHash;

  let fromAccount = Account.load(call.transaction.from.toHex());
  if (fromAccount !== null) {
    evt.account = call.transaction.from.toHex();
  }
  if (account2 != null) {
    let toAccount = Account.load(account2.toHex());
    if (toAccount !== null) {
      evt.account2 = toAccount.id;
    }
  }

  evt.save();
}

export function handleSetActive(call: SetIsActiveCall): void {
  createDebugEvent(call, 'setActive', call.inputs._isActive ? '(true)' : '(false)', null, null);
}

export function handleNewAddress(call: SetNewAddressCall): void {
  createDebugEvent(call, 'newAddress', call.inputs._address.toHex(), null, null);
}

export function handleCashout(call: CashoutCall): void {
  createDebugEvent(call, 'cashout', null, null, null);
}

export function handleTransferOwnership(call: TransferOwnershipCall): void {
  createDebugEvent(call, 'transferOwnership', null, null, call.inputs.newOwner);
}
