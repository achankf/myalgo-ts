import { toIt } from "../iter";

/**
 * Test if "it" is sorted in ascending order.
 */
export function isSorted<T>(it: Iterable<T>, cmp: (a: T, b: T) => number) {
    return toIt(it)
        .pin((prev, cur) => cmp(prev, cur) <= 0)
        .every((x) => x);
}
