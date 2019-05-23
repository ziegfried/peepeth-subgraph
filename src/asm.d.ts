/// <reference path="../node_modules/assemblyscript/index.d.ts" />
type i8 = number;
type u8 = number;
type i16 = number;
type u16 = number;
type i32 = number;
type u32 = number;
type i64 = number;
type u64 = number;
type f64 = number;
type usize = number;

declare function load<T>(ptr: usize, pos: usize): T;

interface UTF8String extends String {
  fromUTF8(): usize;
  lengthUTF8: usize;
}
