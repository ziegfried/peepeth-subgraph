import { Bytes, JSONValue, JSONValueKind, TypedMap } from '@graphprotocol/graph-ts';

/**
 * Make sure the given JSONValue is a string and returns string it contains.
 * Returns `null` otherwise.
 */
export function asString(val: JSONValue | null): string | null {
  if (val != null && val.kind === JSONValueKind.STRING) {
    return val.toString();
  }
  return null;
}

/**
 * Makes sure the given JSONValue is an object and return the object it contains.
 * Returns `null` otherwise.
 */
export function asObject(val: JSONValue | null): TypedMap<string, JSONValue> | null {
  if (val != null && val.kind === JSONValueKind.OBJECT) {
    return val.toObject();
  }
  return null;
}

/**
 * Make sure the given JSONValue is an array and returns that array it contains.
 * Returns `null` otherwise.
 */
export function asArray(val: JSONValue | null): Array<JSONValue> | null {
  if (val != null && val.kind === JSONValueKind.ARRAY) {
    return val.toArray();
  }
  return null;
}

/**
 * Retrieves an integer value from the JSON object with the given key. If this key
 * doesn't exist, or the value is not a number, it returns `defaultValue` instead.
 */
export function intValue(obj: TypedMap<string, JSONValue>, key: string, defaultValue: i32): i32 {
  let val = obj.get(key);
  if (val !== null && val.kind === JSONValueKind.NUMBER) {
    let i = val.toI64();
    return i as i32;
  }
  return defaultValue;
}

/**
 * This function checks if the given byte array contains a valid
 * UTF-8 sequence and can be successfully parsed into a string.
 */
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

export function kindToString(kind: JSONValueKind): string {
  switch (kind) {
    case JSONValueKind.ARRAY:
      return 'ARRAY';
    case JSONValueKind.OBJECT:
      return 'OBJECT';
    case JSONValueKind.STRING:
      return 'STRING';
    case JSONValueKind.NUMBER:
      return 'NUMBER';
    case JSONValueKind.BOOL:
      return 'BOOL';
    case JSONValueKind.NULL:
      return 'NULL';
    default:
      return '?';
  }
}
