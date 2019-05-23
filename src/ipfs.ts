/// <reference path="./asm.d.ts" />
import { ipfs, json, JSONValue, JSONValueKind, log, TypedMap } from '@graphprotocol/graph-ts';
import { asObject } from './util';
import { TransactionInfo } from './transaction';

export function loadFromIpfs(ifpsHash: string, tx: TransactionInfo): TypedMap<string, JSONValue> | null {
  if (tx.state.ipfsReqs > 7) {
    log.warning(
      '[mapping] [loadIpfs] Too many IPFS requests while processing this transaction {}, skipping fetching hash={}',
      [tx.toString(), ifpsHash]
    );
    return null;
  }
  tx.state.ipfsReqs += 1;
  log.debug('[mapping] [loadIpfs] Loading JSON blob from ipfs hash={} for {}', [ifpsHash, tx.toString()]);
  let bytes = ipfs.cat(ifpsHash);
  log.debug('[mapping] [loadIpfs] Completed ipfs.cat from ipfs hash={} for {}', [ifpsHash, tx.toString()]);
  if (bytes !== null) {
    let data = json.fromBytes(bytes!);
    if (data === null) {
      return null;
    }
    if (data.kind !== JSONValueKind.OBJECT) {
      log.debug('[mapping] [loadIpfs] JSON data from IPFS is of type={}, expected OBJECT in {}', [
        data.kind.toString(),
        tx.toString(),
      ]);
    }
    return asObject(data);
  }
  return null;
}
