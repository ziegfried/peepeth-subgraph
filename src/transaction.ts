import { Bytes, Address, EthereumCall, Value } from '@graphprotocol/graph-ts';

export class TransactionInfo {
  blockNumber: i32;
  timestamp: i32;
  from: Address;
  hash: Bytes;

  static fromEthereumCall(call: EthereumCall): TransactionInfo {
    let info = new TransactionInfo();
    info.blockNumber = call.block.number.toI32();
    info.timestamp = call.block.timestamp.toI32();
    info.hash = call.transaction.hash;
    info.from = call.transaction.from;
    return info;
  }

  static fromValue(value: Value): TransactionInfo {
    let arr = value.toArray();
    let info = new TransactionInfo();
    info.blockNumber = arr[0].toI32();
    info.timestamp = arr[1].toI32();
    info.hash = arr[2].toBytes();
    info.from = arr[3].toAddress();
    return info;
  }

  toValue(): Value {
    let timestamp = Value.fromI32(this.timestamp);
    let block = Value.fromI32(this.blockNumber);
    let hash = Value.fromBytes(this.hash);
    let from = Value.fromAddress(this.from);
    let encoded = Value.fromArray([block, timestamp, hash, from]);
    return encoded;
  }

  clone(): TransactionInfo {
    return TransactionInfo.fromValue(this.toValue());
  }
}
