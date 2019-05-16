/// <reference path="./asm.d.ts" />
import { EthereumCall, JSONValue, TypedMap, ipfs, json, JSONValueKind } from '@graphprotocol/graph-ts';
import { PostCall, ReplyCall, ShareCall } from '../generated/Contract/Contract';
import { getGlobalStats } from './peepeth';
import { stringValueOrNull, intValue, loadFromIpfs } from './util';
import { createDebugEvent } from './debug';
import { Peep } from '../generated/schema';

function incrementNumberOfPeeps(): i32 {
  let global = getGlobalStats();
  global.numberOfPeeps += 1;
  global.save();
  return global.numberOfPeeps;
}

function applyPeepCreationInfo(account: Peep, call: EthereumCall): void {
  account.createdInBlock = call.block.number.toI32();
  account.createdInTx = call.transaction.hash;
  account.createdTimestamp = call.block.timestamp.toI32();
}

enum PeepType {
  PEEP,
  SHARE,
  REPLY,
}

export function createPeep(data: TypedMap<string, JSONValue>, id: string, call: EthereumCall): Peep | null {
  let peepType = 'peep';

  let type = stringValueOrNull(data, 'type');
  if (type == peepType) {
    let peep = new Peep(id);
    peep.number = incrementNumberOfPeeps();
    peep.account = call.transaction.from.toHex();
    peep.content = stringValueOrNull(data, 'content');
    peep.pic = stringValueOrNull(data, 'pic');
    peep.timestamp = intValue(data, 'untrustedTimestamp', 0);
    peep.type = 'PEEP';

    let shareKey = 'shareID';
    if (data.isSet(shareKey)) {
      peep.share = stringValueOrNull(data, shareKey);
      peep.type = 'SHARE';
    }

    let replyKey = 'parentID';
    if (data.isSet(replyKey)) {
      peep.replyTo = stringValueOrNull(data, replyKey);
      peep.type = 'REPLY';
    }

    applyPeepCreationInfo(peep, call);
    return peep;
  } else {
    let msg = 'Invalid peep data with type=' + type;
    createDebugEvent(call, 'savePeep', msg, id, null);
  }
  return null;
}

export function handlePost(call: PostCall): void {
  let data = loadFromIpfs(call.inputs._ipfsHash);
  if (data !== null) {
    let peep = createPeep(data!, call.inputs._ipfsHash, call);
    if (peep !== null) {
      peep.save();
    }
  } else {
    createDebugEvent(call, 'handlePost', 'Peep data is null', call.inputs._ipfsHash, null);
  }
}

export function handleShare(call: ShareCall): void {
  let data = loadFromIpfs(call.inputs._ipfsHash);
  if (data !== null) {
    let peep = createPeep(data!, call.inputs._ipfsHash, call);
    if (peep !== null) {
      peep.save();
    }
  } else {
    createDebugEvent(call, 'handleShare', 'Peep data is null', call.inputs._ipfsHash, null);
  }
}

export function handleReply(call: ReplyCall): void {
  let data = loadFromIpfs(call.inputs._ipfsHash);
  if (data !== null) {
    let peep = createPeep(data!, call.inputs._ipfsHash, call);
    if (peep !== null) {
      peep.save();
    }
  } else {
    createDebugEvent(call, 'handleReply', 'Peep data is null', call.inputs._ipfsHash, null);
  }
}
