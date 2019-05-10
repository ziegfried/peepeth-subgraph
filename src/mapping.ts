import {
  ipfs,
  JSONValue,
  json,
  JSONValueKind,
  TypedMap
} from "@graphprotocol/graph-ts";
import {
  PeepethEvent as PeepethEventEvent,
  CreateAccountCall
} from "../generated/Contract/Contract";
import { PeepethEvent, PeepethAccount } from "../generated/schema";

export function handlePeepethEvent(event: PeepethEventEvent): void {
  let entity = new PeepethEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.test = "hello world";
  entity.save();
}

interface AccountInfo {
  info: string;
  location: string;
  realName: string;
  website: string;
  avatarUrl: string;
  backgroundUrl: string;
  messageToWorld: string;
  untrustedTimestamp: number;
}

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

export function handleCreateAccount(call: CreateAccountCall): void {
  let account = new PeepethAccount(call.transaction.from.toHex());
  account.name = call.inputs._name.toString();
  let ipfsHash = call.inputs._ipfsHash;
  account.ipfsHash = ipfsHash;
  let data = ipfs.cat(ipfsHash);
  if (data !== null) {
    let info = json.fromBytes(data!);
    if (info !== null && !info.isNull() && info.kind === JSONValueKind.OBJECT) {
      let infoObj = info.toObject();
      account.info = stringValueOrNull(infoObj, "info");
      account.location = stringValueOrNull(infoObj, "location");
      account.website = stringValueOrNull(infoObj, "website");
    }
  }

  // {
  //   info: "Peepeth creator.",
  //   location: "California",
  //   realName: "Bevan Barton",
  //   website: "https://peepeth.com",
  //   avatarUrl: "peepeth:bECcUGZh:jpg",
  //   backgroundUrl: "peepeth:vbbfAvi2:jpg",
  //   messageToWorld: "Do the right thing.",
  //   untrustedTimestamp: 1521080303
  // }

  account.save();
}
