/// <reference path="./asm.d.ts" />
import { TypedMap, JSONValue, Bytes, JSONValueKind, ipfs, json } from '@graphprotocol/graph-ts';

export function loadFromIpfs(ifpsHash: string): TypedMap<string, JSONValue> | null {
  let bytes = ipfs.cat(ifpsHash);
  if (bytes !== null) {
    let data = json.fromBytes(bytes!);
    if (data !== null && data.kind === JSONValueKind.OBJECT) {
      return data.toObject();
    }
  }
  return null;
}

export function stringValueOrNull(obj: TypedMap<string, JSONValue>, key: string): string | null {
  let val = obj.get(key);
  if (val != null && val.kind === JSONValueKind.STRING) {
    return val.toString();
  }
  return null;
}

export function intValue(obj: TypedMap<string, JSONValue>, key: string, defaultValue: i32): i32 {
  let val = obj.get(key);
  if (val !== null && val.kind === JSONValueKind.NUMBER) {
    let i = val.toI64();
    return i as i32;
  }
  return defaultValue;
}

export function isValidUtf8(bytes: Bytes): boolean {
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
