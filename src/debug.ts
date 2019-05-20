import {
  CashoutCall,
  SetIsActiveCall,
  SetNewAddressCall,
  TransferOwnershipCall,
} from '../generated/Contract/Contract';

export function handleSetActive(call: SetIsActiveCall): void {
  // log.debug('Function call to setActive(isActive={}) in tx={}', [
  //   call.inputs._isActive ? 'true' : 'false',
  //   call.transaction.hash.toHex(),
  // ]);
}

export function handleNewAddress(call: SetNewAddressCall): void {
  // log.debug('Function call to newAddress(address={}) in tx={}', [
  //   call.inputs._address.toHex(),
  //   call.transaction.hash.toHex(),
  // ]);
}

export function handleCashout(call: CashoutCall): void {
  // log.debug('Function call to cashout() in tx={}', [call.transaction.hash.toHex()]);
}

export function handleTransferOwnership(call: TransferOwnershipCall): void {
  // log.debug('Function call to transferOwnership(newOwner={}) in tx={}', [
  //   call.inputs.newOwner.toHex(),
  //   call.transaction.hash.toHex(),
  // ]);
}
