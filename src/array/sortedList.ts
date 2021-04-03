import {
  binarySearch,
  lowerBound,
  range,
  upperBound,
} from "../comparison/binarySearch";
import { mergeK } from "../comparison/merge";
import { MyIterable } from "../iter";

/**
 * A sorted list, only valid as long as data mutation doesn't affect toKey()'s return values. It
 * performs lazy insertion, at the cost of other operations, which potentially leads binary merges (think merge sort).
 * Readings are as fast as binary search can offer.
 * Using this structure either if you need to frequent writes or freqent reads, but not both.
 */
export class SortedList<T, U> extends MyIterable<T> {
  public static wrap<T, U>(
    data: Iterable<T>,
    toKey: (t: T) => U,
    cmp: (a: U, b: U) => number
  ): SortedList<T, U> {
    const sorted = SortedList.sort(Array.from(data), toKey, cmp);
    return SortedList.lightWrap(sorted, toKey, cmp);
  }

  private static lightWrap<T, U>(
    data: T[],
    toKey: (t: T) => U,
    cmp: (a: U, b: U) => number
  ): SortedList<T, U> {
    const ret = new SortedList(toKey, cmp);
    ret.data = data;
    return ret;
  }

  private static sort<T, U>(
    data: T[],
    toKey: (t: T) => U,
    cmp: (a: U, b: U) => number
  ): T[] {
    return data.sort((a, b) => cmp(toKey(a), toKey(b)));
  }

  private data: T[] = [];

  /**
   * Unsorted list of items to be inserted into this.data whenever necessary.
   */
  private pendList: T[] = [];

  constructor(private toKey: (t: T) => U, private cmp: (a: U, b: U) => number) {
    super();
  }

  /**
   * Insert items into the list.
   */
  public add(...items: T[]): this {
    if (items.length !== 0) {
      this.pendList.push(...items);
    }
    return this;
  }

  /**
   * Return the [low index, high index] of all items within the boundary.
   */
  public range(bound1: U, bound2: U): [number, number] | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    return range(this.getData(), bound1, bound2, this.toKey, this.cmp);
  }

  public has(key: U): boolean {
    return this.search(key) !== undefined;
  }

  public get size(): number {
    return this.data.length + this.pendList.length;
  }

  public get isEmpty(): boolean {
    return this.size === 0;
  }

  public clone(): SortedList<T, U> {
    return SortedList.lightWrap(this.getData().slice(), this.toKey, this.cmp);
  }

  public slice(start?: number, end?: number): T[] {
    return this.getData().slice(start, end);
  }

  /**
   * Get everything from the target and above.
   */
  public right(key: U): SortedList<T, U> {
    return SortedList.lightWrap(
      right(this.getData(), key, this.toKey, this.cmp),
      this.toKey,
      this.cmp
    );
  }

  /**
   * Get everything lower and equal to the target.
   */
  public left(key: U): SortedList<T, U> {
    return SortedList.lightWrap(
      left(this.getData(), key, this.toKey, this.cmp),
      this.toKey,
      this.cmp
    );
  }

  /** Get items found by the boundary. If nothing is found, return an empty array. */
  public get(bound1: U, bound2?: U): T[] {
    const r =
      bound2 === undefined ? this.search(bound1) : this.range(bound1, bound2);

    if (r === undefined) {
      return [];
    }

    const [low, high] = r;
    return this.slice(low, high + 1);
  }

  /** Count the number of elements within the boundary */
  public countRange(bound1: U, bound2?: U): number {
    const r =
      bound2 === undefined ? this.search(bound1) : this.range(bound1, bound2);

    if (r === undefined) {
      return 0;
    }

    const [low, high] = r;
    const ret = high - low + 1;
    console.assert(ret >= 1);
    return ret;
  }

  /** Get an item by its index. Not sure how this is useful when the point of
   * this data structure is range search (with get()).
   */
  public getAt(idx: number): T | undefined {
    return this.getData()[idx];
  }

  /** Delete items specified by the index. */
  public deleteAt(idx: number, len = 1): this {
    if (len >= 1) {
      if (idx >= 0 && idx < this.size) {
        this.getData().splice(idx, len); // this.getData() would possibly perform sort and merge
      }
    }

    return this;
  }

  /**
   * Delete everything that equals item
   * @param key the target
   */
  public delete(key: U): this {
    const data = this.getData();
    const range1 = binarySearch(data, key, this.toKey, this.cmp);
    if (range1 === undefined) {
      return this;
    }
    const [low, high] = range1;
    const len = high - low + 1;
    console.assert(len >= 1);
    data.splice(low, len);
    return this;
  }

  /**
   * Returns a range that contains the target and its duplicates
   * @param key the target
   */
  public search(key: U): [number, number] | undefined {
    return binarySearch(this.getData(), key, this.toKey, this.cmp);
  }

  protected iterate = (): T[] => this.getData();

  private getData(): T[] {
    if (this.pendList.length > 0) {
      const sortedPending = SortedList.sort(
        this.pendList,
        this.toKey,
        this.cmp
      );
      this.data = mergeK(this.toKey, this.cmp, sortedPending, this.data);
      this.pendList = [];
    }
    return this.data;
  }
}

function right<T, U>(
  data: T[],
  item: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): T[] {
  if (data.length === 0) {
    return [];
  }
  const idx = lowerBound(data, item, toKey, cmp);
  return data.slice(idx);
}

function left<T, U>(
  data: T[],
  item: U,
  toKey: (t: T) => U,
  cmp: (a: U, b: U) => number
): T[] {
  if (data.length === 0) {
    return [];
  }
  const idx = upperBound(data, item, toKey, cmp);
  return data.slice(0, idx + 1);
}
