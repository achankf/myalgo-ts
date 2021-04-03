import { MinHeap } from "../array/minheap";
import { assertDefined } from "../assert";
import { binaryInsert } from "./binarySearch";

/**
 * The binary heap based, k-way merge algorithm of sorted lists. Merging 2
 * lists is specialized to either single-item insertion based on binary search,
 * or with multiple items merge sort's binary merge. This method doesn't mutate
 * its arguments.
 * @param toKey turn list items into values that are compared
 * @param cmp the comparator
 * @param lists a list of *sorted* lists of Ts
 */
export function mergeK<T, U>(
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number,
  ...lists: T[][]
): T[] {
  const nonEmpty = lists.filter((list) => list.length > 0);

  switch (nonEmpty.length) {
    case 0:
      return [];
    case 1:
      return nonEmpty[0].slice();
    case 2: {
      // merge a single item - use binary search
      const list0 = nonEmpty[0];
      const list1 = nonEmpty[1];
      if (list0.length === 1) {
        return binaryInsert(list1.slice(), list0[0], toKey, cmp);
      }
      if (list1.length === 1) {
        return binaryInsert(list0.slice(), list1[0], toKey, cmp);
      }

      // merge them directly, no need for the fancy loop below
      return Array.from(merge2(list0, list1, toKey, cmp));
    }
  }

  // 3 or more lists -- use heap-based merge

  const heap = MinHeap.inPlaceWrap(
    ([listA, idxA], [listB, idxB]) =>
      cmp(toKey(listA[idxA]), toKey(listB[idxB])),
    nonEmpty.map((_, i): [T[], number] => [nonEmpty[i], 0])
  );

  const ret = [];
  for (;;) {
    const [lst, idx] = assertDefined(heap.pop());
    ret.push(lst[idx]);
    const next = idx + 1;

    if (heap.size === 0) {
      return next < lst.length ? ret.concat(lst.slice(next)) : ret;
    }
    if (next < lst.length) {
      heap.add([lst, next]);
    }
  }
}

function merge2<T, U>(
  sorted1: T[],
  sorted2: T[],
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): T[] {
  console.assert(sorted1.length > 0 && sorted2.length > 0); // this part is handled by mergeK

  let idx1 = 0;
  let idx2 = 0;
  const ret: T[] = [];
  for (;;) {
    const t1 = sorted1[idx1];
    const t2 = sorted2[idx2];

    if (cmp(toKey(t1), toKey(t2)) < 0) {
      ret.push(t1);
      ++idx1;
    } else {
      ret.push(t2);
      ++idx2;
    }
    if (idx1 === sorted1.length) {
      if (idx2 < sorted2.length) {
        return ret.concat(sorted2.slice(idx2));
      }
      return ret;
    }
    if (idx2 === sorted2.length) {
      if (idx1 < sorted1.length) {
        return ret.concat(sorted1.slice(idx1));
      }
      return ret;
    }
  }
  // unreachable
}
