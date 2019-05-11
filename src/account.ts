import { EthereumCall, ipfs, json, JSONValueKind, store } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';
import { isValidUtf8, stringValueOrNull } from './util';
import {
  ChangeNameCall,
  CreateAccountCall,
  TransferAccountCall,
  UpdateAccountCall,
} from '../generated/Contract/Contract';

function loadAccountInfoFromIpfs(account: Account, ipfsHash: string): void {
  account.ipfsHash = ipfsHash;
  let data = ipfs.cat(ipfsHash);
  if (data !== null) {
    let info = json.fromBytes(data!);
    if (info !== null && !info.isNull() && info.kind === JSONValueKind.OBJECT) {
      let infoObj = info.toObject();
      account.info = stringValueOrNull(infoObj, 'info');
      account.location = stringValueOrNull(infoObj, 'location');
      account.website = stringValueOrNull(infoObj, 'website');
      account.realName = stringValueOrNull(infoObj, 'realName');
      account.avatarUrl = stringValueOrNull(infoObj, 'avatarUrl');
      account.backgroundUrl = stringValueOrNull(infoObj, 'backgroundUrl');
      account.messageToWorld = stringValueOrNull(infoObj, 'messageToWorld');
    }
  }
}

function applyAccountCreationInfo(account: Account, call: EthereumCall): void {
  account.createdInBlock = call.block.number.toI32();
  account.createdInTx = call.transaction.hash;
  account.createdTimestamp = call.block.timestamp.toI32();
}

function applyAccountUpdateInfo(account: Account, call: EthereumCall): void {
  account.updatedInBlock = call.block.number.toI32();
  account.updatedInTx = call.transaction.hash;
  account.updatedTimestamp = call.block.timestamp.toI32();
}

export function handleCreateAccount(call: CreateAccountCall): void {
  let account = new Account(call.transaction.from.toHex());
  applyAccountCreationInfo(account, call);
  if (isValidUtf8(call.inputs._name)) {
    account.name = call.inputs._name.toString();
  } else {
    account.name = '#INVALID#<' + call.inputs._name.toHexString() + '>';
  }
  loadAccountInfoFromIpfs(account, call.inputs._ipfsHash);
  account.save();
}

export function handleUpdateAccount(call: UpdateAccountCall): void {
  let from = call.transaction.from.toHex();
  let account = Account.load(from);
  if (account === null) {
    account = new Account(from);
    account.name = '';
    applyAccountCreationInfo(account!, call);
  }
  applyAccountUpdateInfo(account!, call);
  loadAccountInfoFromIpfs(account!, call.inputs._ipfsHash);
  account.save();
}

export function handleChangeName(call: ChangeNameCall): void {
  let from = call.transaction.from.toHex();
  let account = Account.load(from);
  if (account !== null) {
    if (isValidUtf8(call.inputs._name)) {
      account.name = call.inputs._name.toString();
    } else {
      account.name = '#INVALID#<' + call.inputs._name.toHexString() + '>';
    }
    applyAccountUpdateInfo(account!, call);
  }
  account.save();
}

export function handleTransferAccount(call: TransferAccountCall): void {
  let id = call.transaction.hash.toHex();
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

    applyAccountUpdateInfo(account!, call);

    account.save();
    store.remove('Account', id);
  }
}
