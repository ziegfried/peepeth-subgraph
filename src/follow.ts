import { FollowCall, UnFollowCall } from '../generated/Contract/Contract';
import { Account } from '../generated/schema';

export function addNewFollower(accountAddress: string, followeeAddress: string): void {
  let a1 = Account.load(accountAddress);
  let a2 = Account.load(followeeAddress);
  if (a1 !== null && a2 !== null) {
    a1.following.push(followeeAddress);
    a1.save();
  }
}

export function handleFollow(call: FollowCall): void {
  addNewFollower(call.transaction.from.toHex(), call.inputs._followee.toHex());
}

export function handleUnfollow(call: UnFollowCall): void {
  // createDebugEvent(call, 'unfollow', null, null, call.inputs._followee);
}
