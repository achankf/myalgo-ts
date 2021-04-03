import { upperBound } from "./binarySearch";

const cmp = (a: number, b: number) => a - b;
const identity = <T>(x: T) => x;

test("base case (empty list)", () => {
  expect(upperBound([], 12345, identity, cmp)).toBe(0);
});

test("small list", () => {
  const arr1to5 = [1, 2, 3, 4, 5];
  expect(upperBound(arr1to5, 0, identity, cmp)).toBe(0); // all items > target
  expect(upperBound(arr1to5, 1, identity, cmp)).toBe(0);
  expect(upperBound(arr1to5, 2, identity, cmp)).toBe(1);
  expect(upperBound(arr1to5, 3, identity, cmp)).toBe(2);
  expect(upperBound(arr1to5, 4, identity, cmp)).toBe(3);
  expect(upperBound(arr1to5, 5, identity, cmp)).toBe(4);
  expect(upperBound(arr1to5, 6, identity, cmp)).toBe(5); // all items < target
  expect(upperBound(arr1to5, 999, identity, cmp) === 5); // all items < target
});

test("searching existing elements", () => {
  const arr: number[] = [];
  const first = 1234;
  for (let i = 0; i < 700; i++) {
    const item = first * i;
    arr.push(item);
  }
  const truthy = arr.every(
    (val, i) => upperBound(arr, val, identity, cmp) === i
  );
  expect(truthy).toBeTruthy();
});

test("with duplicates", () => {
  const dup = [-10, -6, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 5, 10];
  expect(upperBound(dup, -6, identity, cmp)).toBe(1);
  expect(upperBound(dup, 1, identity, cmp)).toBe(2);
  // in between gaps
  expect(upperBound(dup, -7, identity, cmp)).toBe(1);
  expect(upperBound(dup, -5, identity, cmp)).toBe(2);
  expect(upperBound(dup, -4, identity, cmp)).toBe(2);
  expect(upperBound(dup, -3, identity, cmp)).toBe(2);
  expect(upperBound(dup, -2, identity, cmp)).toBe(2);
  expect(upperBound(dup, -1, identity, cmp)).toBe(2);
  expect(upperBound(dup, 0, identity, cmp)).toBe(2);
  expect(upperBound(dup, 6, identity, cmp)).toBe(14);
  expect(upperBound(dup, 7, identity, cmp)).toBe(14);
  expect(upperBound(dup, 8, identity, cmp)).toBe(14);
  expect(upperBound(dup, 9, identity, cmp)).toBe(14);
  // search duplicate items
  expect(upperBound(dup, 2, identity, cmp)).toBe(8);
  expect(upperBound(dup, 3, identity, cmp)).toBe(11);
});
