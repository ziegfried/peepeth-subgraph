import {
  ipfs,
  JSONValue,
  json,
  JSONValueKind,
  TypedMap,
  Bytes,
  store,
  EthereumCall,
  Address
} from "@graphprotocol/graph-ts";
import { Account, DebugEvent } from "../generated/schema";
import {
  CreateAccountCall,
  UpdateAccountCall,
  TransferAccountCall,
  ChangeNameCall,
  FollowCall,
  UnFollowCall,
  SetIsActiveCall,
  ReplyCall,
  SetNewAddressCall,
  ShareCall,
  PostCall,
  SaveBatchCall,
  CashoutCall,
  TransferOwnershipCall
} from "../generated/Contract/Contract";

function stringValueOrNull(
  obj: TypedMap<string, JSONValue>,
  key: string
): string | null {
  let val = obj.get(key);
  if (val != null && val.kind === JSONValueKind.STRING) {
    return val.toString();
  }
  return null;
}

function isValidUtf8(bytes: Bytes): boolean {
  let pending = 0;
  for (let i = 0; i < bytes.length; i++) {
    let b = bytes[i];
    if (pending === 0) {
      let m = 0b10000000;
      while ((m & b) !== 0) {
        pending += 1;
        m = m >> 1;
      }
      if (pending === 0) {
        continue;
      }
      if (pending === 1 || pending > 4) {
        return false;
      }
    } else {
      if ((b & 0b11000000) !== 0b10000000) {
        return false;
      }
    }
    pending -= 1;
  }
  return pending === 0;
}

function loadAccountInfoFromIpfs(account: Account, ipfsHash: string): void {
  account.ipfsHash = ipfsHash;
  let data = ipfs.cat(ipfsHash);
  if (data !== null) {
    let info = json.fromBytes(data!);
    if (info !== null && !info.isNull() && info.kind === JSONValueKind.OBJECT) {
      let infoObj = info.toObject();
      account.info = stringValueOrNull(infoObj, "info");
      account.location = stringValueOrNull(infoObj, "location");
      account.website = stringValueOrNull(infoObj, "website");
      account.realName = stringValueOrNull(infoObj, "realName");
      account.avatarUrl = stringValueOrNull(infoObj, "avatarUrl");
      account.backgroundUrl = stringValueOrNull(infoObj, "backgroundUrl");
      account.messageToWorld = stringValueOrNull(infoObj, "messageToWorld");
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
    account.name = "#INVALID#<" + call.inputs._name.toHexString() + ">";
  }
  loadAccountInfoFromIpfs(account, call.inputs._ipfsHash);
  account.save();
}

export function handleUpdateAccount(call: UpdateAccountCall): void {
  let from = call.transaction.from.toHex();
  let account = Account.load(from);
  if (account === null) {
    account = new Account(from);
    account.name = "";
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
      account.name = "#INVALID#<" + call.inputs._name.toHexString() + ">";
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
    store.remove("Account", id);
  }
}

function createDebugEvent(
  call: EthereumCall,
  fn: string,
  message: string | null,
  ipfsHash: string | null,
  account2: Address | null
): void {
  let evt = new DebugEvent(call.transaction.hash.toHex());
  evt.fn = fn;
  evt.block = call.block.number.toI32();
  evt.tx = call.transaction.hash;
  evt.from = call.transaction.from;
  let fromAccount = Account.load(call.transaction.from.toHex());
  if (fromAccount !== null) {
    evt.account = call.transaction.from.toHex();
  }
  if (account2 != null) {
    let toAccount = Account.load(account2.toHex());
    if (toAccount !== null) {
      evt.account2 = toAccount.id;
    }
  }

  evt.save();
}

export function handleFollow(call: FollowCall): void {
  createDebugEvent(call, "follow", null, null, call.inputs._followee);
}

export function handleUnfollow(call: UnFollowCall): void {
  createDebugEvent(call, "unfollow", null, null, call.inputs._followee);
}

export function handleSetActive(call: SetIsActiveCall): void {
  createDebugEvent(
    call,
    "setActive",
    call.inputs._isActive ? "(true)" : "(false)",
    null,
    null
  );
}

export function handleReply(call: ReplyCall): void {
  createDebugEvent(call, "reply", null, call.inputs._ipfsHash, null);
}

export function handleNewAddress(call: SetNewAddressCall): void {
  createDebugEvent(
    call,
    "newAddress",
    call.inputs._address.toHex(),
    null,
    null
  );
}

export function handleShare(call: ShareCall): void {
  createDebugEvent(call, "share", null, call.inputs._ipfsHash, null);
}

export function handlePost(call: PostCall): void {
  createDebugEvent(call, "post", null, call.inputs._ipfsHash, null);
}

export function handleSaveBatch(call: SaveBatchCall): void {
  createDebugEvent(call, "saveBatch", null, call.inputs._ipfsHash, null);
}

export function handleCashout(call: CashoutCall): void {
  createDebugEvent(call, "cashout", null, null, null);
}

export function handleTransferOwnership(call: TransferOwnershipCall): void {
  createDebugEvent(call, "transferOwnership", null, null, call.inputs.newOwner);
}
