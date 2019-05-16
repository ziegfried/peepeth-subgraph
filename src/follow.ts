/// <reference path="./asm.d.ts" />
import { FollowCall, UnFollowCall } from '../generated/Contract/Contract';
import { Follower } from '../generated/schema';
import { EthereumCall } from '@graphprotocol/graph-ts';

export function addNewFollower(
  accountAddress: string,
  followeeAddress: string,
  timestamp: i32,
  call: EthereumCall
): void {
  let id = accountAddress + '-' + followeeAddress;
  let f = new Follower(id);
  f.account = accountAddress;
  f.followee = followeeAddress;
  f.timestamp = timestamp;
  f.createdTimestamp = call.block.timestamp.toI32();
  f.createdInBlock = call.block.number.toI32();
  f.createdInTx = call.transaction.hash;
  f.save();
}

export function handleFollow(call: FollowCall): void {
  addNewFollower(
    call.transaction.from.toHex(),
    call.inputs._followee.toHex(),
    call.block.timestamp.toI32(),
    call
  );
}

export function handleUnfollow(call: UnFollowCall): void {
  // TODO
  // createDebugEvent(call, 'unfollow', null, null, call.inputs._followee);
}
