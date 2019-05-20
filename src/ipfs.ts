/// <reference path="./asm.d.ts" />
import { ipfs, json, JSONValue, JSONValueKind, log, TypedMap } from '@graphprotocol/graph-ts';
import { asObject } from './util';

export function loadFromIpfs(ifpsHash: string): TypedMap<string, JSONValue> | null {
  let bytes = ipfs.cat(ifpsHash);
  if (bytes !== null) {
    let data = json.fromBytes(bytes!);
    if (data === null) {
      return null;
    }
    if (data.kind !== JSONValueKind.OBJECT) {
      log.debug('[findme1] JSON data from IPFS is of type={}, expected OBJECT', [data.kind.toString()]);
    }
    return asObject(data);
  }
  return null;
}
