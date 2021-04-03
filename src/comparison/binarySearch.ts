function binsearchHelper<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number,
  low: number,
  high: number
): [boolean, number, number, number] {
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = toKey(arr[mid]);
    const order = cmp(midVal, target);
    if (order < 0) {
      low = mid + 1;
    } else if (order > 0) {
      high = mid - 1;
    } else {
      return [true, mid, low, high];
    }
  }

  return [false, low, low, high];
}

function findLeft<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number,
  ret: number,
  oldLow: number
): number {
  let prev = ret;
  let prevLow = oldLow;
  for (;;) {
    const rightMost = prev - 1;
    const [isFound, at, low] = binsearchHelper(
      arr,
      target,
      toKey,
      cmp,
      prevLow,
      rightMost
    );
    if (!isFound) {
      return prev;
    }
    console.assert(at <= rightMost); // i.e. progress
    prev = at;
    prevLow = low;
  }
}

function findRight<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number,
  ret: number,
  oldHigh: number
): number {
  let prev = ret;
  let prevHigh = oldHigh;
  for (;;) {
    const leftMost = prev + 1;
    const [isFound, at, , high] = binsearchHelper(
      arr,
      target,
      toKey,
      cmp,
      leftMost,
      prevHigh
    );
    if (!isFound) {
      return prev;
    }
    console.assert(at >= leftMost); // i.e. progress
    prev = at;
    prevHigh = high;
  }
}

/**
 * Perform binary search for the first index that matches the target. If not
 * found, return 0 if target is less than every items in the array, otherwise arr.length.
 */
export function lowerBound<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): number {
  {
    const [isFound, ret, low] = binsearchHelper(
      arr,
      target,
      toKey,
      cmp,
      0,
      arr.length - 1
    );
    if (!isFound) {
      return ret;
    }
    return findLeft(arr, target, toKey, cmp, ret, low);
  }
}

/**
 * Perform binary search for the last index that matches the target.
 * If not found, return 0 if target is less than every items in the array,
 * otherwise arr.length.
 */
export function upperBound<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): number {
  {
    const [isFound, ret, , high] = binsearchHelper(
      arr,
      target,
      toKey,
      cmp,
      0,
      arr.length - 1
    );
    if (!isFound) {
      return ret;
    }
    return findRight(arr, target, toKey, cmp, ret, high);
  }
}

/**
 * Binary search to get a range where the target is matched.
 */
export function binarySearch<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): [number, number] | undefined {
  // use linear search to find the duplicates
  {
    const [isFound, ret, low, high] = binsearchHelper(
      arr,
      target,
      toKey,
      cmp,
      0,
      arr.length - 1
    );
    if (!isFound) {
      return undefined;
    }

    const lowFinal = findLeft(arr, target, toKey, cmp, ret, low);
    const highFinal = findRight(arr, target, toKey, cmp, ret, high);

    return [lowFinal, highFinal];
  }
}

/**
 * Test whether an item exist in the array. Just binary search.
 */
export function binarySearchExist<T, U>(
  arr: T[],
  target: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): boolean {
  const [isFound] = binsearchHelper(arr, target, toKey, cmp, 0, arr.length - 1);
  return isFound;
}

/**
 * Insert an item to a sorted array, search with binary search, O(n) due to copying.
 *  This algorithm mutates arr. This function mutates the array.
 */
export function binaryInsert<T, U>(
  arr: T[],
  target: T,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): T[] {
  const idx = lowerBound(arr, toKey(target), toKey, cmp);
  const empty = arr.splice(idx, 0, target);
  console.assert(empty.length === 0);
  return arr;
}

/**
 * Delete item and its duplicates from a sorted array.
 */
export function binaryDelete<T, U>(
  arr: T[],
  item: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): T[] {
  const range1 = binarySearch(arr, item, toKey, cmp);
  if (range1 !== undefined) {
    const [low, high] = range1;
    const len = high - low + 1;
    arr.splice(low, len);
  }
  return arr;
}

/**
 * Perform a range search on a boundary fromed by bound1 and bound2. The order of bound1 and bound2 doesn't matter.
 */
export function range<T, U>(
  arr: T[],
  bound1: U,
  bound2: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): [number, number] | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  let low;
  let high;
  const order = cmp(bound1, bound2);
  if (order < 0) {
    low = bound1;
    high = bound2;
  } else if (order > 0) {
    low = bound2;
    high = bound1;
  } else {
    // just binary search
    return binarySearch(arr, bound1, toKey, cmp);
  }

  const lowB = lowerBound(arr, low, toKey, cmp);
  const upperB = upperBound(arr, high, toKey, cmp);
  console.assert(lowB <= upperB);
  return [lowB, upperB];
}
