import { Address } from '@graphprotocol/graph-ts';

export function verifySignature(address: Address, signature: string, data: string): boolean {
  // TODO: Verify signature - need ecrecover implementation in assembly script or
  // a new host export from graph-node

  return true;
}
