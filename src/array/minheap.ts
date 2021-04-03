import { MyIterable, MyIterator, toIt } from "../iter";

/**
 * Array-based binary heap.
 */
export class MinHeap<T> extends MyIterable<T> {
  /**
   * Make an array copy of it and heapify it.
   * @param it the data
   * @param cmp the comparator
   */
  public static heapify<T>(
    cmp: (a: T, b: T) => number,
    ...arr: T[]
  ): MinHeap<T> {
    return MinHeap.inPlaceWrap(cmp, arr);
  }

  /**
   * Create a heap in-place by mutating the given array. The caller should consider the ownership of arr.
   * @param arr an array to be mutated in-place
   * @param cmp the comparator
   */
  public static inPlaceWrap<T>(
    cmp: (a: T, b: T) => number,
    arr: T[]
  ): MinHeap<T> {
    return MinHeap.unsafeWrap(heapifyArray(arr, cmp), cmp);
  }

  /**
   * Wraps a heapified array into a MinHeap without any checking whatsoever.
   * @param arr an heapified array slice, presumably generated from MinHeap.slice()
   * @param cmp the comparator
   */
  private static unsafeWrap<T>(
    arr: T[],
    cmp: (a: T, b: T) => number
  ): MinHeap<T> {
    const ret = new MinHeap<T>(cmp);
    ret.arr = arr;
    return ret;
  }

  private arr: T[] = [];

  constructor(private cmp: (a: T, b: T) => number) {
    super();
  }

  /** Returns the number of items in the heap */
  public get size(): number {
    return this.arr.length;
  }

  /** Remove the most important (minimum) item in the heap. This action mutates the heap. */
  public pop(): T | undefined {
    const ret = pop(this.arr, this.arr.length, this.cmp);
    const poped = this.arr.pop();
    console.assert(ret === poped);
    return ret;
  }

  /** Get the most important (minimum) item in the heap. */
  public get top(): T | undefined {
    return this.isEmpty ? undefined : this.arr[0];
  }

  /**
   * Sort the collection in reverse order (i.e. low-to-high priority of MIN
   * heap <-- note MIN). This method resets the heap and mutate the data array in-place.
   */
  public reverseSort(): T[] {
    const arr = this.arr;
    this.arr = []; // clears the array in case for reusing this heap
    for (let len = arr.length; len > 0; len--) {
      // pop works by swapping the root to the end and then correct the structure by bubbledown the root
      pop(arr, len, this.cmp);
    }
    return arr;
  }

  /**
   * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
   * This method resets the heap and mutate the data array in-place.
   */
  public sortInPlace(): T[] {
    const sorted = this.reverseSort();
    let first = 0;
    let last = sorted.length - 1;

    // reverse the reverse-sorted array
    while (first < last) {
      swap(sorted, first, last);
      ++first;
      --last;
    }
    return sorted;
  }

  /**
   * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
   * This operation doesn't mutate the heap but a slice of the sorted data will be created.
   */
  public sort(): MyIterator<T> {
    const ret = this.sortHelper();
    return toIt(ret);
  }

  /**
   * Add an item into the heap.
   */
  public add(data: T): void {
    const idx = this.arr.length;
    this.arr.push(data);
    bubbleUp(this.arr, idx, this.cmp);
  }

  protected iterate = (): IterableIterator<T> => {
    return this.sortHelper();
  };

  private sortHelper() {
    return sort(this.arr.slice(), this.cmp);
  }
}

function* sort<T>(
  heapifiedArray: T[],
  cmp: (a: T, b: T) => number
): Generator<T, void, unknown> {
  const arr = heapifiedArray;
  let val = pop(arr, arr.length, cmp);
  while (val !== undefined) {
    const ret = arr.pop();
    if (!ret) {
      throw new Error("bug: should have element to pop");
    }
    yield ret;
    val = pop(arr, arr.length, cmp);
  }
}

function heapifyArray<T>(arr: T[], cmp: (a: T, b: T) => number): T[] {
  for (let i = Math.floor((arr.length - 1) / 2); i >= 0; i--) {
    bubbleDown(arr, i, arr.length, cmp);
  }
  return arr;
}

function parent(n: number): number {
  return Math.floor((n + 1) / 2) - 1;
}

function leftChild(i: number): number {
  return 2 * i + 1;
}

function swap<T>(arr: T[], i: number, j: number): void {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

// pop swaps the root to the end of the array; caller is responsible for memeory management
// not handling memory here because pop() is crucial for the in-place sort
function pop<T>(
  arr: T[],
  length: number,
  cmp: (a: T, b: T) => number
): T | undefined {
  const lenMinus = length - 1;
  if (length === 0) {
    return;
  } else if (length === 1) {
    // since this method only does swapping in arr, there's no need to swap when arr only has 1 item
    return arr[lenMinus];
  }

  const ret = arr[0];
  swap(arr, 0, lenMinus); // replace root with the last element and then bubbledown
  bubbleDown(arr, 0, lenMinus, cmp);
  return ret;
}

function bubbleDown<T>(
  arr: T[],
  startIdx: number,
  length: number,
  cmp: (a: T, b: T) => number
): void {
  const itemVal = arr[startIdx];
  let prev = startIdx; // iterator starting at the root node defined by start
  for (;;) {
    let candidate = leftChild(prev);
    if (candidate >= length) {
      // left-child doesn't exist
      break; // implied that right child doesn't exist too
    }

    // children found, pick the lowest of the 2 children
    const left = arr[candidate];
    const rightIdx = candidate + 1;
    if (
      rightIdx < length && // right-child exists and
      cmp(arr[rightIdx], left) < 0 // right child is less than left-child
    ) {
      candidate = rightIdx; // pick the right child
    }

    // compare "me" with the lowest child
    if (cmp(itemVal, arr[candidate]) < 0) {
      break; // "I" am the lowest
    }

    swap(arr, prev, candidate);
    prev = candidate;
  }
}

function bubbleUp<T>(
  arr: T[],
  startIdx: number,
  cmp: (a: T, b: T) => number
): void {
  console.assert(startIdx === arr.length - 1);

  // keep swapping with ancestors if the given item is smaller than them
  let cur = startIdx;
  while (cur > 0) {
    const par = parent(cur);
    if (cmp(arr[cur], arr[par]) < 0) {
      swap(arr, cur, par);
    }
    cur = par;
  }
}
