import { genBy } from "../iter";
import { listDiff, listEqual } from "./cmpList";
import { isSorted } from "./isSorted";
import { mergeK } from "./merge";

const toKey = (t: number) => t;
const cmp = (a: number, b: number) => a - b;

const listGen = (len = 1000) =>
  genBy(() =>
    genBy(() => Math.random())
      .take(len)
      .collect()
      .sort()
  );

test("base case (merge no lists)", () => {
  const ret = mergeK(toKey, cmp);
  expect(ret.length).toBe(0);
});

test("base case (merge empty lists)", () => {
  const list1: number[] = [];
  const list2: number[] = [];
  const list3: number[] = [];
  const list4: number[] = [];
  const ret = mergeK(toKey, cmp, list1, list2, list3, list4);
  expect(ret.length).toBe(0);
});

test("base case (one element)", () => {
  const list1 = [1];
  const list2 = [2];
  const list3 = [3];
  const list4 = [4];
  const ret = mergeK(toKey, cmp, list1, list2, list3, list4);
  expect(listEqual(cmp, ret, [1, 2, 3, 4])).toBeTruthy();
});

test("base case (1 list)", () => {
  const list1 = listGen().inject()!;
  const ret = mergeK(toKey, cmp, list1);
  expect(listEqual(cmp, ret, list1)).toBeTruthy();
});

test("base case (2 lists)", () => {
  const len = 1000;
  const list1 = listGen(len).inject()!;
  expect(list1.length).toBe(len);
  const list2 = listGen(len).inject()!;
  expect(list2.length).toBe(len);

  const ret = mergeK(toKey, cmp, list1, list2);
  expect(list1.length).toBe(len);
  expect(list2.length).toBe(len);
  expect(ret.length).toBe(2 * len);

  const sorted = list1.concat(list2).sort();
  expect(listDiff(cmp, ret, sorted)).toBeUndefined();
});

test("base case (n list)", () => {
  const len = 100;
  const n = 100;
  const lists = listGen(len).take(n).collect();
  const ret = mergeK(toKey, cmp, ...lists);
  expect(lists.length).toBe(n);
  expect(lists.every((list) => list.length === len)).toBeTruthy();
  expect(ret.length).toBe(n * len);
  expect(isSorted(ret, cmp)).toBeTruthy();
  expect(
    lists.every((list) => list.every((x) => ret.indexOf(x) !== -1))
  ).toBeTruthy();
});

test("mergeSort", () => {
  // don't do this
  function mergeSort(arr: number[]) {
    return mergeK(toKey, cmp, ...arr.map((x) => [x]));
  }

  const ranList = listGen(10000).inject()!;
  const sorted = mergeSort(ranList);
  expect(isSorted(sorted, cmp));
});

test("merging unsorted lists (wrong but shouldn't crash)", () => {
  const l1 = [6, 2, 1, 8, 2, 7];
  const l2 = [6, 2, 1, 8, 2, 7];
  const l3 = [6, 2, 1, 8, 2, 7];

  // even though the input lists aren't sorted, mergeK shouldn't throw exceptions -- it's the caller's responsibility.
  mergeK(toKey, cmp, l1, l2, l3);
});
