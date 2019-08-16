import { Address, JSONValue, log, TypedMap } from '@graphprotocol/graph-ts';
import { SaveBatchCall } from '../generated/PeepethContract/PeepethContract';
import { updateAccount, createAccount } from './account';
import { addNewFollower, removeFollower } from './follow';
import { loadFromIpfs } from './ipfs';
import { createPeepFromIPFS } from './peep';
import { verifySignature } from './signature';
import { TransactionInfo } from './transaction';
import { asArray, asObject, asString, intValue, kindToString } from './util';

// Common keys in various batch-related JSON documents

let KEY_BATCH_SAVE_JSON = 'batchSaveJSON';
let KEY_PEEP = 'peep';
let KEY_UNTRUSTED_TIMESTAMP = 'untrustedTimestamp';
let KEY_IPFS = 'ipfs';
let KEY_SAVE_BATCH = 'saveBatch';
let KEY_FOLLOW = 'follow';
let KEY_UNFOLLOW = 'unfollow';
let KEY_FOLLOWEE = 'followee';
let KEY_LOVE = 'love';
let KEY_SIGNED_ACCOUNT = 'signedAccount';
let KEY_ENABLE_DELEGATE = 'enableDelegate';
let KEY_DISABLE_DELEGATE = 'disableDelegate';
let KEY_ACCOUNT_UPDATE = 'accountUpdate';
let KEY_SIGNED_ACTIONS = 'signedActions';
let KEY_SIGNED_BATCH = 'userSignedBatch';

/**
 * Creates a new transaction info where the `from` address is assigned
 * an address if the signature can be sucessfully verified to originate from that
 * wallet address.
 *
 * Passing the resuling transaction info to other methods (such as createPeep) allows
 * us to assiciate stored object with that wallet address as if the transaction was
 * created by that wallet.
 */
function assumeSignedSender(
  signedObject: TypedMap<string, JSONValue>,
  ipfsHash: string,
  tx: TransactionInfo,
  signatureRequired: boolean
): TransactionInfo | null {
  let address = asString(signedObject.get('address'));
  let signature = asString(signedObject.get('signature'));
  if (address == null || signature == null) {
    if (signatureRequired) {
      log.warning('[mapping] [assumeSigned] unable to assume signed sender, address={} or signature={}', [
        address != null ? address : 'null',
        signature != null ? signature : 'null',
      ]);
      // Return turn null, signalling the signature verification failed
      return null;
    } else {
      // Return original transaction info if signature is not required in this
      // particular action and signature into not present in the JSON object
      return tx;
    }
  }
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

  // Invalid signature
  return null;
}

/**
 * Determines if the given JSON object contains a new peep.
 * If it does it goes ahead and creates that new peep and returns `true`.
 * Otherwise it returns `false`.
 */
function processPeep(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo, signed: boolean): boolean {
  let peepObj = asObject(batchObj.get(KEY_PEEP));
  if (peepObj != null) {
    let ipfsHash = asString(peepObj.get(KEY_IPFS));
    if (ipfsHash != null) {
      let effectiveTx: TransactionInfo | null = tx;
      if (signed) {
        effectiveTx = assumeSignedSender(peepObj!, ipfsHash, tx!, false);
        if (effectiveTx == null) {
          return true;
        }
      }
      createPeepFromIPFS(ipfsHash, KEY_SAVE_BATCH, effectiveTx!);
    }
    return true;
  }
  return false;
}

/**
 * Determines if the given JSON object contains follow action information.
 * If it does it goes ahead and creates that new follower and returns `true`.
 * Otherwise it returns `false`.
 */
function processFollow(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
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

/**
 * Determines if the given JSON object contains unfollow action information.
 * If it does it goes ahead and removes that follower and returns `true`.
 * Otherwise it returns `false`.
 */
function processUnfollow(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
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

/**
 * Determines if the given JSON object contains account update information.
 * If it does it goes ahead and updates the account and returns `true`.
 * Otherwise it returns `false`.
 */
function processAccountUpdate(
  batchObj: TypedMap<string, JSONValue>,
  tx: TransactionInfo,
  signed: boolean
): boolean {
  let updateObj = asObject(batchObj.get(KEY_ACCOUNT_UPDATE));
  if (updateObj != null) {
    let ipfsHash = asString(updateObj.get(KEY_IPFS));
    if (ipfsHash != null) {
      let effectiveTx: TransactionInfo | null = tx;
      if (signed) {
        effectiveTx = assumeSignedSender(updateObj!, ipfsHash, tx!, false);
        if (effectiveTx == null) {
          log.warning(
            '[mapping] [processAccountUpdate] ignoring account update from ipfs hash={} tx={} - could not verify signature',
            [ipfsHash, tx.toString()]
          );

          return true;
        }
      }
      updateAccount(tx.from.toHex(), effectiveTx!, ipfsHash);
    }
    return true;
  }
  return false;
}

function processSignedAccount(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let accountObj = asObject(batchObj.get(KEY_SIGNED_ACCOUNT));
  if (accountObj != null) {
    let ipfsHash = asString(accountObj.get(KEY_IPFS));
    if (ipfsHash != null) {
      let effectiveTx: TransactionInfo | null = assumeSignedSender(accountObj!, ipfsHash, tx!, false);
      if (effectiveTx == null) {
        log.warning(
          '[mapping] [processSignedAccount] ignoring signed account from ipfs hash={} tx={} - could not verify signature',
          [ipfsHash, tx.toString()]
        );
        return true;
      }
      createAccount(null, effectiveTx!, ipfsHash);
    }
    return true;
  }
  return false;
}

function processEnableDelegate(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let delegateObj = asObject(batchObj.get(KEY_ENABLE_DELEGATE));
  if (delegateObj != null) {
    // log.debug('[mapping] [enableDelegate] ignorign');
    // TODO
    return true;
  }
  return false;
}

function processDisableDelegate(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let delegateObj = asObject(batchObj.get(KEY_DISABLE_DELEGATE));
  if (delegateObj != null) {
    // TODO
    return true;
  }
  return false;
}

/**
 * Determines if the given JSON object contains love action information.
 * Returns `true` if it does, otherwise it returns `false`.
 */
function processLove(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let loveObj = asObject(batchObj.get(KEY_LOVE));
  if (loveObj != null) {
    // Ignoring love actions for now. Maybe we'll add support for it in the future.
    return true;
  }
  return false;
}

/**
 * Attempts to process the given batch item (which can be a peep, follow, unfollow, etc).
 * Returns `true` if the item was processed, otherwise `false` if the item could not be
 * recognized and was ignored.
 */
function processBatchItem(batchObj: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let processed =
    processPeep(batchObj, tx, false) ||
    processFollow(batchObj, tx) ||
    processUnfollow(batchObj, tx) ||
    processLove(batchObj, tx) ||
    processAccountUpdate(batchObj, tx, false);

  if (!processed) {
    log.warning('[mapping] [batchItem] Unhandled batch obj keys={} in {}', [
      objectKeys(batchObj!),
      tx.toString(),
    ]);
  }

  return processed;
}

/**
 * Attempts to process the given JSON object as a batch of actions. Returns `true` if
 * in fact it was a batch of actions, `false` if it wasn't.
 */
function processBatchJSON(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let batchData = asArray(data.get(KEY_BATCH_SAVE_JSON));
  if (batchData != null) {
    for (let i = 0, len = batchData.length; i < len; i++) {
      let batchObj = asObject(batchData![i]);
      if (batchObj != null) {
        processBatchItem(batchObj!, tx);
      } else {
        log.warning('[mapping] [batchItem] Batch entry is not an object instead saw kind={} in {}', [
          kindToString(batchData![i].kind),
          tx.toString(),
        ]);
      }
    }
    return true;
  }
  return false;
}

/**
 * Attempts to process the given JSON object as a batch of signed actions. Returns `true` if
 * in fact it was a batch of signed actions, `false` if it wasn't.
 */
function processUserSignedBatch(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let signedBatch = asObject(data.get(KEY_SIGNED_BATCH));
  if (signedBatch != null) {
    let ipfsHash = asString(signedBatch.get(KEY_IPFS));

    if (ipfsHash != null) {
      let txInfo = assumeSignedSender(signedBatch!, ipfsHash, tx, true);
      if (txInfo != null) {
        processBatch(ipfsHash, txInfo!);
      }
    }
    return true;
  }
  return false;
}

/**
 * Attempts to process the given JSON object as a batch of signed actions. Returns `true` if
 * in fact it was a batch of signed actions, `false` if it wasn't.
 */
function processSignedActions(data: TypedMap<string, JSONValue>, tx: TransactionInfo): boolean {
  let signedActions = asArray(data.get(KEY_SIGNED_ACTIONS));
  if (signedActions != null) {
    for (let i = 0, len = signedActions.length; i < len; i++) {
      let obj = asObject(signedActions![i]);
      if (obj != null) {
        let processed =
          processUserSignedBatch(obj!, tx) ||
          processSignedAccount(obj!, tx) ||
          processAccountUpdate(obj!, tx, true) ||
          processEnableDelegate(obj!, tx) ||
          processDisableDelegate(obj!, tx) ||
          processPeep(obj!, tx, true) ||
          processLove(obj!, tx);
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

/** Creates a string containing comma-separated keys of the JSON object for debug logging */
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

/** Loads a batch JSON document from IPFS and processes the actions it contains (signed or unsigned) */
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

/** Handles calls to `saveBatch(string)` */
export function handleSaveBatch(call: SaveBatchCall): void {
  let ipfsHash = call.inputs._ipfsHash;
  let tx = TransactionInfo.fromEthereumCall(call);
  log.debug('[mapping] [batchHandler] Processing batch from {} ipfs hash={}', [tx.toString(), ipfsHash]);
  processBatch(ipfsHash, tx);
  log.debug('[mapping] [batchHandler] Completed batch from {} ipfs hash={}', [tx.toString(), ipfsHash]);
}
