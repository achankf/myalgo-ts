import { genBy, repeat } from "../iter";
import { binaryDelete, binaryInsert } from "./binarySearch";
import { isSorted } from "./isSorted";

const cmp1 = (a: number, b: number) => a - b;
const cmp2 = (a: number, b: number) => b - a;

function insertionSort<T, U>(
  arr: T[],
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
) {
  let ret: T[] = [];
  for (const val of arr) {
    ret = binaryInsert(ret, val, toKey, cmp);
  }
  return ret;
}

test("base case", () => {
  const val = 1234;
  const ret = binaryInsert(new Array<number>(), val, (x) => x, cmp1);
  expect(ret.length).toBe(1);
  expect(ret[0]).toBe(val);
});

test("feed random numbers to insertion sort (backed by binaryInsert)", () => {
  const len = 10000;

  const ret = genBy(() => Math.random())
    .take(len)
    .collect();
  expect(
    isSorted(
      insertionSort(ret, (x) => x, cmp1),
      cmp1
    )
  ).toBeTruthy();
});

test("duplicates", () => {
  const len = 1000;
  const input = [...repeat(5).take(len), ...repeat(1).take(len), 4];
  const ret = insertionSort(input, (x) => x, cmp1);
  expect(isSorted(ret, cmp1)).toBeTruthy();
  expect(ret.length).toBe(2 * len + 1);

  expect(ret[0]).toBe(1);
  expect(ret[ret.length - 1]).toBe(5);

  expect(ret[1000]).toBe(4);
  expect(ret[1000]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);
  expect(ret[1002]).toBe(4);
});

test("duplicates (high to low)", () => {
  const len = 1000;
  const input: number[] = [];
  for (let i = 0; i < len; i++) {
    input.push(5);
  }
  for (let i = 0; i < len; i++) {
    input.push(1);
  }
  input.push(4);
  const ret = insertionSort(input, (x) => x, cmp2);
  expect(isSorted(ret, cmp2)).toBeTruthy();

  expect(ret[0]).toBe(5);
  expect(ret[ret.length - 1]).toBe(1);

  expect(ret.length).toBe(2 * len + 1);
  expect(ret[1000]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);
  expect(ret[1002]).toBe(4);
});

test("duplicates (delete)", () => {
  const len = 1000;
  const input: number[] = [];
  for (let i = 0; i < len; i++) {
    input.push(5);
  }
  for (let i = 0; i < len; i++) {
    input.push(1);
  }
  input.push(4);
  const ret = insertionSort(input, (x) => x, cmp1);
  expect(isSorted(ret, cmp1)).toBeTruthy();

  expect(ret.length).toBe(2 * len + 1);

  expect(ret[0]).toBe(1);
  expect(ret[ret.length - 1]).toBe(5);

  expect(ret[1000]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);

  binaryInsert(ret, 4, (x) => x, cmp1);
  expect(ret[1000]).toBe(4);
  expect(ret[1001]).toBe(4);
  expect(ret[1002]).toBe(4);

  binaryDelete(ret, 4, (x) => x, cmp1);
  expect(ret.length).toBe(2 * len);
  expect(ret.every((x) => x !== 4)).toBeTruthy();

  binaryDelete(ret, 1, (x) => x, cmp1);
  expect(ret.length).toBe(len);
  expect(ret.every((x) => x === 5)).toBeTruthy();

  binaryDelete(ret, 5, (x) => x, cmp1);
  expect(ret.length).toBe(0);
});
