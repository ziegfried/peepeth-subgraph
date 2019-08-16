import { log, store, TypedMap, JSONValue } from '@graphprotocol/graph-ts';
import { getGlobalStats } from './global';
import { loadFromIpfs } from './ipfs';
import { TransactionInfo } from './transaction';
import { asString, isValidUtf8 } from './util';
import { Account } from '../generated/schema';
import {
  ChangeNameCall,
  CreateAccountCall,
  TransferAccountCall,
  UpdateAccountCall,
} from '../generated/PeepethContract/PeepethContract';

/**
 * Loads account information from IPFS and applies it to the given account instance
 */
function loadAccountInfoFromIpfs(
  account: Account,
  ipfsHash: string,
  tx: TransactionInfo
): TypedMap<string, JSONValue> | null {
  account.ipfsHash = ipfsHash;
  let infoObj = loadFromIpfs(ipfsHash, tx);
  if (infoObj !== null) {
    account.info = asString(infoObj.get('info'));
    account.location = asString(infoObj.get('location'));
    account.website = asString(infoObj.get('website'));
    account.realName = asString(infoObj.get('realName'));
    account.avatarUrl = asString(infoObj.get('avatarUrl'));
    account.backgroundUrl = asString(infoObj.get('backgroundUrl'));
    account.messageToWorld = asString(infoObj.get('messageToWorld'));
    return infoObj;
  } else {
    log.warning('[mapping] Unable to load account info from IPFS hash={}', [ipfsHash]);
  }
  return null;
}

function applyAccountCreationInfo(account: Account, tx: TransactionInfo): void {
  account.createdInBlock = tx.blockNumber;
  account.createdInTx = tx.hash;
  account.createdTimestamp = tx.timestamp;
}

function applyAccountUpdateInfo(account: Account, tx: TransactionInfo): void {
  account.updatedInBlock = tx.blockNumber;
  account.updatedInTx = tx.hash;
  account.updatedTimestamp = tx.timestamp;
}

export function createAccount(name: string | null, tx: TransactionInfo, ipfsHash: string): void {
  let account = new Account(tx.from.toHex());
  applyAccountCreationInfo(account, tx);
  let infoObj = loadAccountInfoFromIpfs(account, ipfsHash, tx);

  if (name != null) {
    account.name = name;
  } else if (infoObj != null) {
    let provisionalName = asString(infoObj.get('provisionalName'));
    if (provisionalName != null) {
      account.name = provisionalName;
    }
  }

  let globalStats = getGlobalStats();
  globalStats.numberOfAccounts += 1;
  globalStats.save();

  account.number = globalStats.numberOfAccounts;
  account.save();
}

/**
 * Attempts to update the account with the informatin from IPFS.
 * If the account doesn't exist, a new Account instance is created.
 */
export function updateAccount(id: string, tx: TransactionInfo, ipfsHash: string): void {
  let account = Account.load(id);
  if (account === null) {
    account = new Account(id);
    account.name = '';
    applyAccountCreationInfo(account!, tx);
  }
  applyAccountUpdateInfo(account!, tx);
  loadAccountInfoFromIpfs(account!, ipfsHash, tx);
  account.save();
}

/** Handler function for `createAccount(bytes16, string)` calls */
export function handleCreateAccount(call: CreateAccountCall): void {
  let txInfo = TransactionInfo.fromEthereumCall(call);
  let name: string;
  // Check if name is valid UTF-8 string, since subgraph fails otherwise
  if (isValidUtf8(call.inputs._name)) {
    name = call.inputs._name.toString();
  } else {
    name = '#INVALID#<' + call.inputs._name.toHexString() + '>';
  }
  createAccount(name, txInfo, call.inputs._ipfsHash);
}

/** Handler function for `updateAccount(string)` calls */
export function handleUpdateAccount(call: UpdateAccountCall): void {
  let txInfo = TransactionInfo.fromEthereumCall(call);
  updateAccount(call.transaction.from.toHex(), txInfo, call.inputs._ipfsHash);
}

/**
 * Handler function for `changeName(bytes16)` calls. This is currently not
 * wired up, see subgraph.yaml
 */
export function handleChangeName(call: ChangeNameCall): void {
  let from = call.transaction.from.toHex();
  let account = Account.load(from);
  let tx = TransactionInfo.fromEthereumCall(call);
  if (account !== null) {
    if (isValidUtf8(call.inputs._name)) {
      account.name = call.inputs._name.toString();
    } else {
      account.name = '#INVALID#<' + call.inputs._name.toHexString() + '>';
    }
    applyAccountUpdateInfo(account!, tx);
    account.save();
  }
}

/**
 * Handler function for `transferAccount(address)` calls. This function
 * creates a new account (with `from` of this transaction), copies
 * all the info from the old account and deletes the original account instance.
 */
export function handleTransferAccount(call: TransferAccountCall): void {
  let id = call.transaction.hash.toHex();
  let tx = TransactionInfo.fromEthereumCall(call);
  let original = Account.load(id);
  if (original != null) {
    let account = new Account(call.inputs._address.toHex());

    account.name = original.name;
    account.ipfsHash = original.ipfsHash;
    account.info = original.info;
    account.website = original.website;
    account.location = original.location;
    account.realName = original.realName;
    account.avatarUrl = original.avatarUrl;
    account.backgroundUrl = original.backgroundUrl;
    account.messageToWorld = original.messageToWorld;

    account.createdInBlock = original.createdInBlock;
    account.createdInTx = original.createdInTx;
    account.createdTimestamp = original.createdTimestamp;

    applyAccountUpdateInfo(account!, tx);

    account.save();
    store.remove('Account', id);
  }
}
