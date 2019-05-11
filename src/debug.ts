import { Address, EthereumCall } from '@graphprotocol/graph-ts';
import { Account, DebugEvent } from '../generated/schema';
import {
  CashoutCall,
  FollowCall,
  PostCall,
  ReplyCall,
  SaveBatchCall,
  SetIsActiveCall,
  SetNewAddressCall,
  ShareCall,
  TransferOwnershipCall,
  UnFollowCall,
} from '../generated/Contract/Contract';

function createDebugEvent(
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

export function handleFollow(call: FollowCall): void {
  createDebugEvent(call, 'follow', null, null, call.inputs._followee);
}

export function handleUnfollow(call: UnFollowCall): void {
  createDebugEvent(call, 'unfollow', null, null, call.inputs._followee);
}

export function handleSetActive(call: SetIsActiveCall): void {
  createDebugEvent(call, 'setActive', call.inputs._isActive ? '(true)' : '(false)', null, null);
}

export function handleReply(call: ReplyCall): void {
  createDebugEvent(call, 'reply', null, call.inputs._ipfsHash, null);
}

export function handleNewAddress(call: SetNewAddressCall): void {
  createDebugEvent(call, 'newAddress', call.inputs._address.toHex(), null, null);
}

export function handleShare(call: ShareCall): void {
  createDebugEvent(call, 'share', null, call.inputs._ipfsHash, null);
}

export function handlePost(call: PostCall): void {
  createDebugEvent(call, 'post', null, call.inputs._ipfsHash, null);
}

export function handleSaveBatch(call: SaveBatchCall): void {
  createDebugEvent(call, 'saveBatch', null, call.inputs._ipfsHash, null);
}

export function handleCashout(call: CashoutCall): void {
  createDebugEvent(call, 'cashout', null, null, null);
}

export function handleTransferOwnership(call: TransferOwnershipCall): void {
  createDebugEvent(call, 'transferOwnership', null, null, call.inputs.newOwner);
}
