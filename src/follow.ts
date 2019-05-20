/// <reference path="./asm.d.ts" />
import { store } from '@graphprotocol/graph-ts';
import { FollowCall, UnFollowCall } from '../generated/Contract/Contract';
import { Follower } from '../generated/schema';
import { TransactionInfo } from './transaction';

function followerId(accountAddress: string, followeeAddress: string): string {
  return accountAddress + '-' + followeeAddress;
}

export function addNewFollower(
  accountAddress: string,
  followeeAddress: string,
  timestamp: i32,
  tx: TransactionInfo
): void {
  let f = new Follower(followerId(accountAddress, followeeAddress));
  f.account = accountAddress;
  f.followee = followeeAddress;
  f.timestamp = timestamp;
  f.createdTimestamp = tx.timestamp;
  f.createdInBlock = tx.blockNumber;
  f.createdInTx = tx.hash;
  f.save();
}

export function removeFollower(accountAddress: string, followeeAddress: string): void {
  store.remove('Follower', followerId(accountAddress, followeeAddress));
}

export function handleFollow(call: FollowCall): void {
  addNewFollower(
    call.transaction.from.toHex(),
    call.inputs._followee.toHex(),
    call.block.timestamp.toI32(),
    TransactionInfo.fromEthereumCall(call)
  );
}

export function handleUnfollow(call: UnFollowCall): void {
  removeFollower(call.transaction.from.toHex(), call.inputs._followee.toHex());
}
