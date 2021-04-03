import { fullOuterJoin, IMapReadonly } from "./map/mapIter";

/**
 * Negates all values in the map.
 */
export function negate<T>(map: IMapReadonly<T, number>): Map<T, number> {
  const ret = new Map<T, number>();
  for (const [key, qty] of map) {
    ret.set(key, -qty);
  }
  return ret;
}

/**
 * Sum all numbers together
 * @param it a sequence of numbers
 */
export function sum(...args: number[]): number {
  let ret = 0;
  for (const num of args) {
    ret += num;
  }
  return ret;
}

/** Calculate the average of given numbers. */
export function average(arg1: number, ...args: number[]): number {
  return (arg1 + sum(...args)) / (args.length + 1);
}

/**
 * Map each item to a number and then sum them up together.
 */
export function sumBy<T>(mapper: (t: T) => number, it: Iterable<T>): number {
  let ret = 0;
  for (const t of it) {
    ret += mapper(t);
  }
  return ret;
}

/**
 * Accumulate the sum of of maps by the key.
 * @param maps maps of T->number
 */
export function sumMaps<T>(
  ...maps: Array<IMapReadonly<T, number>>
): Map<T, number> {
  return fullOuterJoin((...vs) => sum(...vs), ...maps);
}
