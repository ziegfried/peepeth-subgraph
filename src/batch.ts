import { Address, JSONValue, log, TypedMap } from '@graphprotocol/graph-ts';
import { SaveBatchCall } from '../generated/Contract/Contract';
import { updateAccount } from './account';
import { addNewFollower, removeFollower } from './follow';
import { loadFromIpfs } from './ipfs';
import { createPeepFromIPFS } from './peep';
import { verifySignature } from './signature';
import { TransactionInfo } from './transaction';
import { asArray, asObject, asString, intValue } from './util';

let KEY_BATCH_SAVE_JSON = 'batchSaveJSON';
let KEY_PEEP = 'peep';
let KEY_UNTRUSTED_TIMESTAMP = 'untrustedTimestamp';
let KEY_IPFS = 'ipfs';
let KEY_SAVE_BATCH = 'saveBatch';
let KEY_FOLLOW = 'follow';
let KEY_UNFOLLOW = 'unfollow';
let KEY_FOLLOWEE = 'followee';
let KEY_LOVE = 'love';
let KEY_ACCOUNT_UPDATE = 'accountUpdate';
let KEY_SIGNED_ACTIONS = 'signedActions';
let KEY_SIGNED_BATCH = 'userSignedBatch';

function assumeSignedSender(
  signedObject: TypedMap<string, JSONValue>,
  ipfsHash: string,
  tx: TransactionInfo
): TransactionInfo | null {
  let address = asString(signedObject.get('address'));
  let signature = asString(signedObject.get('signature'));
  log.info('[mapping] [assumeSigned] user signed object ipfs={} address={} signature={} in {}', [
    ipfsHash,
    address,
    signature,
    tx.toString(),
  ]);

  let from = Address.fromString(address!);
  // Verify ipfs hash has been signed by account owner
  if (verifySignature(from, signature, ipfsHash)) {
    let txInfo = tx.clone();
    // Override from address on transaction info, ie. treat the signed action
    // as if it was a transaction by the signer
    txInfo.from = from;
    return txInfo;
  }

  return null;
}

function processPeep(
  batchObj: TypedMap<string, JSONValue> | null,
  tx: TransactionInfo,
  signed: boolean
): boolean {
  let peepObj = asObject(batchObj.get(KEY_PEEP));
  if (peepObj != null) {
    let ipfsHash = asString(peepObj.get(KEY_IPFS));
    if (ipfsHash != null) {
      let txInfo: TransactionInfo | null = tx;
      if (signed && peepObj.isSet('signature')) {
        txInfo = assumeSignedSender(peepObj!, ipfsHash, tx!);
      }
      if (txInfo == null) {
        return true;
      }
      createPeepFromIPFS(ipfsHash, KEY_SAVE_BATCH, txInfo!);
    }
    return true;
  }
  return false;
}

function processFollow(batchObj: TypedMap<string, JSONValue> | null, tx: TransactionInfo): boolean {
  let followObj = asObject(batchObj.get(KEY_FOLLOW));
  if (followObj != null) {
    let followee = asString(followObj.get(KEY_FOLLOWEE));
    if (followee != null) {
      let timestamp = intValue(followObj!, KEY_UNTRUSTED_TIMESTAMP, 0);
      addNewFollower(tx.from.toHex(), followee, timestamp, tx);
    }
    return true;
  }
  return false;
}

function processUnfollow(batchObj: TypedMap<string, JSONValue> | null, tx: TransactionInfo): boolean {
  let followObj = asObject(batchObj.get(KEY_UNFOLLOW));
  if (followObj != null) {
    let followee = asString(followObj.get(KEY_FOLLOWEE));
    if (followee != null) {
      removeFollower(tx.hash.toHex(), followee);
    }
    return true;
  }
  return false;
}

function processAccountUpdate(batchObj: TypedMap<string, JSONValue> | null, tx: TransactionInfo): boolean {
  let updateObj = asObject(batchObj.get(KEY_ACCOUNT_UPDATE));
  if (updateObj != null) {
    let ipfsHash = asString(updateObj.get(KEY_IPFS));
    if (ipfsHash != null) {
      updateAccount(tx.from.toHex(), tx, ipfsHash);
    }
    return true;
  }
  return false;
}

function processLove(batchObj: TypedMap<string, JSONValue> | null, tx: TransactionInfo): boolean {
  let loveObj = asObject(batchObj.get(KEY_LOVE));
  if (loveObj != null) {
    // ignore for now, TODO
    return true;
  }
  return false;
}

function processBatchItem(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let processed =
    processPeep(batchObj, tx, false) ||
    processFollow(batchObj, tx) ||
    processUnfollow(batchObj, tx) ||
    processLove(batchObj, tx) ||
    processAccountUpdate(batchObj, tx);

  if (!processed) {
    log.warning('[mapping] [batchItem] Unhandled batch obj keys={} in {}', [
      objectKeys(batchObj!),
      tx.toString(),
    ]);
  }

  return processed;
}

function processBatchJSON(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let batchData = asArray(data.get(KEY_BATCH_SAVE_JSON));
  if (batchData != null) {
    for (let i = 0, len = batchData.length; i < len; i++) {
      let batchObj = asObject(batchData![i]);
      if (batchObj != null) {
        processBatchItem(batchObj!, tx);
      } else {
        log.warning('[mapping] [batchItem] Batch entry is not an object instead saw kind={} in {}', [
          batchData![i].kind.toString(),
          tx.toString(),
        ]);
      }
    }
    return true;
  }
  return false;
}

function processUserSignedBatch(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let signedBatch = asObject(data.get(KEY_SIGNED_BATCH));
  if (signedBatch != null) {
    let ipfsHash = asString(signedBatch.get(KEY_IPFS));

    if (ipfsHash != null) {
      let txInfo = assumeSignedSender(signedBatch!, ipfsHash, tx);
      if (txInfo != null) {
        processBatch(ipfsHash, txInfo!);
      }
    }
    return true;
  }
  return false;
}

function processSignedActions(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let signedActions = asArray(data.get(KEY_SIGNED_ACTIONS));
  if (signedActions != null) {
    for (let i = 0, len = signedActions.length; i < len; i++) {
      let obj = asObject(signedActions![i]);
      if (obj != null) {
        let processed = processUserSignedBatch(obj!, tx) || processPeep(obj, tx, true);
        if (!processed) {
          log.warning('[mapping] [signedAction] Unable to process signed action with keys={} in {}', [
            objectKeys(obj!),
            tx.toString(),
          ]);
        }
      }
    }
    return true;
  }
  return false;
}

function objectKeys(obj: TypedMap<string, JSONValue>): string {
  let result = '';
  for (let i = 0, len = obj.entries.length; i < len; i++) {
    result += obj.entries[i].key;
    if (i < len - 1) {
      result += ',';
    }
  }
  return result;
}

function processBatch(ipfsHash: string, tx: TransactionInfo): void {
  let data = loadFromIpfs(ipfsHash, tx);
  if (data != null) {
    let processed = processBatchJSON(data!, tx) || processSignedActions(data!, tx);
    if (!processed) {
      log.warning('[mapping] [batchHandler] Did not find batch data in saveBatch JSON blob (keys={}) in {}', [
        objectKeys(data!),
        tx.toString(),
      ]);
    }
  }
}

export function handleSaveBatch(call: SaveBatchCall): void {
  let ipfsHash = call.inputs._ipfsHash;
  let tx = TransactionInfo.fromEthereumCall(call);
  log.debug('[mapping] [batchHandler] Processing batch from {} ipfs hash={}', [tx.toString(), ipfsHash]);
  processBatch(ipfsHash, tx);
  log.debug('[mapping] [batchHandler] Completed batch from {} ipfs hash={}', [tx.toString(), ipfsHash]);
}
