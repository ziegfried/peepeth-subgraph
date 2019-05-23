/// <reference path="./asm.d.ts" />
import { ByteArray, Bytes, JSONValue, JSONValueKind, TypedMap } from '@graphprotocol/graph-ts';

export function asString(val: JSONValue | null): string | null {
  if (val != null && val.kind === JSONValueKind.STRING) {
    return val.toString();
  }
  return null;
}

export function asObject(val: JSONValue | null): TypedMap<string, JSONValue> | null {
  if (val != null && val.kind === JSONValueKind.OBJECT) {
    return val.toObject();
  }
  return null;
}

export function asArray(val: JSONValue | null): Array<JSONValue> | null {
  if (val != null && val.kind === JSONValueKind.ARRAY) {
    return val.toArray();
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

export function stringToUft8Bytes(str: UTF8String): ByteArray {
  let ptr = str.fromUTF8();
  let len = str.lengthUTF8;

  let bytes = new ByteArray(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = load<u8>(ptr, i);
  }
  return bytes;
}
