import { binarySearch, lowerBound, upperBound } from "./binarySearch";

function binTestMatch<T, U>(arr: T[], toKey: (t: T) => U, cmp1: (a: U, b: U) => number) {
    for (const n of arr) {
        const ret = binarySearch(arr, toKey(n), toKey, cmp1)!;
        expect(ret).toBeDefined();
        const [low, high] = ret;
        expect(low).toBe(lowerBound(arr, toKey(n), toKey, cmp1));
        expect(high).toBe(upperBound(arr, toKey(n), toKey, cmp1));
    }
}

const cmp = (a: number, b: number) => a - b;

test("base case (empty list)", () => {
    expect(binarySearch([], 12345, (x) => x, cmp)).toBeUndefined();
});

test("small list", () => {
    const arr1to5 = [1, 2, 3, 4, 5];
    binTestMatch(arr1to5, (x) => x, cmp);
    expect(binarySearch(arr1to5, 0, (x) => x, cmp)).toBeUndefined(); // all items > target
    expect(binarySearch(arr1to5, 6, (x) => x, cmp)).toBeUndefined();  // all items < target
    expect(binarySearch(arr1to5, 999, (x) => x, cmp)).toBeUndefined(); // all items < target
});

test("searching existing elements", () => {
    const arr: number[] = [];
    const first = 1234;
    for (let i = 0; i < 700; i++) {
        const item = first * i;
        arr.push(item);
    }
    const truthy = arr.every((val, i) => lowerBound(arr, val, (x) => x, cmp) === i);
    expect(truthy).toBeTruthy();
});

test("with duplicates", () => {
    const dup = [-10, -6, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 5, 10];
    binTestMatch(dup, (x) => x, cmp);
});
