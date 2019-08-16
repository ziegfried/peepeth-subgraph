import { JSONValue, log, TypedMap } from '@graphprotocol/graph-ts';
import { PostCall, ReplyCall, ShareCall } from '../generated/PeepethContract/PeepethContract';
import { Peep } from '../generated/schema';
import { getGlobalStats } from './global';
import { asString, intValue } from './util';
import { TransactionInfo } from './transaction';
import { loadFromIpfs } from './ipfs';

/**
 * Increase global counter of peeps by 1 and returns that
 * incremented value.
 */
function incrementNumberOfPeeps(): i32 {
  let global = getGlobalStats();
  global.numberOfPeeps += 1;
  global.save();
  return global.numberOfPeeps;
}

/** Creates and stores a new Peep instance from the information in JSON object */
export function createPeep(data: TypedMap<string, JSONValue>, id: string, tx: TransactionInfo): Peep | null {
  let peepType = 'peep';

  let type = asString(data.get('type'));
  if (type == peepType) {
    let peep = new Peep(id);
    peep.number = incrementNumberOfPeeps();
    peep.account = tx.from.toHex();
    let content = asString(data.get('content'));
    if (content == null) {
      peep.content = '';
    } else {
      peep.content = content;
    }
    peep.pic = asString(data.get('pic'));
    peep.timestamp = intValue(data, 'untrustedTimestamp', 0);
    peep.type = 'PEEP';

    let shareId = asString(data.get('shareID'));
    if (shareId != null) {
      peep.share = shareId;
      peep.type = 'SHARE';
    }

    let replyId = asString(data.get('parentID'));
    if (replyId != null) {
      peep.replyTo = replyId;
      peep.type = 'REPLY';
    }

    peep.createdInBlock = tx.blockNumber;
    peep.createdInTx = tx.hash;
    peep.createdTimestamp = tx.timestamp;

    return peep;
  } else {
    let typeString = type;
    if (typeString == null) {
      typeString = '<null>';
    }
    log.warning('[mapping] Ignoring invalid peep of type={} in tx={}', [typeString, tx.hash.toHex()]);
  }
  return null;
}

/**
 * Downloads the JSON blob from IPFS, makes sure it contains peep data
 * and creates a new peep record in the store
 */
export function createPeepFromIPFS(ipfsHash: string, fn: string, tx: TransactionInfo): void {
  let data = loadFromIpfs(ipfsHash, tx);
  if (data !== null) {
    let peep = createPeep(data!, ipfsHash, tx);
    if (peep !== null) {
      peep.save();
    }
  } else {
    log.warning('[mapping] [createPeepFromIPFS] Unable to load data from IPFS hash={} fn={} tx={}', [
      ipfsHash,
      fn,
      tx.toString(),
    ]);
    let globals = getGlobalStats();
    globals.numberOfPeepsNotFound += 1;
    globals.save();
  }
}

/** Handler function for `post(string)` */
export function handlePost(call: PostCall): void {
  createPeepFromIPFS(call.inputs._ipfsHash, 'post', TransactionInfo.fromEthereumCall(call));
}

/** Handler function for share(string) */
export function handleShare(call: ShareCall): void {
  createPeepFromIPFS(call.inputs._ipfsHash, 'share', TransactionInfo.fromEthereumCall(call));
}

/** Handler function for reply(string) */
export function handleReply(call: ReplyCall): void {
  createPeepFromIPFS(call.inputs._ipfsHash, 'reply', TransactionInfo.fromEthereumCall(call));
}
