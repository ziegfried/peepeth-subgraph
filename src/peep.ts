import { PostCall, ShareCall, ReplyCall } from '../generated/Contract/Contract';
import { getGlobalStats } from './peepeth';

function incrementNumberOfPeeps(): i32 {
  let global = getGlobalStats();
  global.numberOfPeeps += 1;
  global.save();
  return global.numberOfPeeps;
}

export function handlePost(call: PostCall): void {
  // createDebugEvent(call, 'post', null, call.inputs._ipfsHash, null);
  incrementNumberOfPeeps();
}

export function handleShare(call: ShareCall): void {
  // createDebugEvent(call, 'share', null, call.inputs._ipfsHash, null);
  incrementNumberOfPeeps();
}

export function handleReply(call: ReplyCall): void {
  incrementNumberOfPeeps();
}
