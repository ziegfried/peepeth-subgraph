/// <reference path="./asm.d.ts" />
import { store } from '@graphprotocol/graph-ts';
import { FollowCall, UnFollowCall } from '../generated/Contract/Contract';
import { Follower, Account } from '../generated/schema';
import { TransactionInfo } from './transaction';

/** Unique ID for the follower/followee combination */
function followerId(accountAddress: string, followeeAddress: string): string {
  return accountAddress + '-' + followeeAddress;
}

/** Creates a new follower, associating it with the followee */
export function addNewFollower(
  accountAddress: string,
  followeeAddress: string,
  timestamp: i32,
  tx: TransactionInfo
): void {
  let a = Account.load(accountAddress);
  let b = Account.load(followeeAddress);
  if (a != null && b != null) {
    let f = new Follower(followerId(accountAddress, followeeAddress));
    f.account = accountAddress;
    f.followee = followeeAddress;
    f.timestamp = timestamp;
    f.createdTimestamp = tx.timestamp;
    f.createdInBlock = tx.blockNumber;
    f.createdInTx = tx.hash;
    f.save();
  }
}

/** Removes the follower */
export function removeFollower(accountAddress: string, followeeAddress: string): void {
  store.remove('Follower', followerId(accountAddress, followeeAddress));
}

/** Handler function for `follow(address)` calls */
export function handleFollow(call: FollowCall): void {
  addNewFollower(
    call.transaction.from.toHex(),
    call.inputs._followee.toHex(),
    call.block.timestamp.toI32(),
    TransactionInfo.fromEthereumCall(call)
  );
}

/** Handler function for `unFollow(address)` calls */
export function handleUnfollow(call: UnFollowCall): void {
  removeFollower(call.transaction.from.toHex(), call.inputs._followee.toHex());
}
