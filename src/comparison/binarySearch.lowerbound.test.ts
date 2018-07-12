import { lowerBound } from "./binarySearch";

const cmp = (a: number, b: number) => a - b;

test("base case (empty list)", () => {
    expect(lowerBound([], 12345, (x) => x, cmp)).toBe(0);
});

test("small list", () => {
    const arr1to5 = [1, 2, 3, 4, 5];
    expect(lowerBound(arr1to5, 0, (x) => x, cmp)).toBe(0); // all items > target
    expect(lowerBound(arr1to5, 1, (x) => x, cmp)).toBe(0);
    expect(lowerBound(arr1to5, 2, (x) => x, cmp)).toBe(1);
    expect(lowerBound(arr1to5, 3, (x) => x, cmp)).toBe(2);
    expect(lowerBound(arr1to5, 4, (x) => x, cmp)).toBe(3);
    expect(lowerBound(arr1to5, 5, (x) => x, cmp)).toBe(4);
    expect(lowerBound(arr1to5, 6, (x) => x, cmp)).toBe(5); // all items < target
    expect(lowerBound(arr1to5, 999, (x) => x, cmp)).toBe(5); // all items < target
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
    expect(lowerBound(dup, -1000, (x) => x, cmp)).toBe(0);
    expect(lowerBound(dup, -6, (x) => x, cmp)).toBe(1);
    expect(lowerBound(dup, 1, (x) => x, cmp)).toBe(2);
    // in between gaps
    expect(lowerBound(dup, -7, (x) => x, cmp)).toBe(1);
    expect(lowerBound(dup, -5, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, -4, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, -3, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, -2, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, -1, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, 0, (x) => x, cmp)).toBe(2);
    expect(lowerBound(dup, 6, (x) => x, cmp)).toBe(14);
    expect(lowerBound(dup, 7, (x) => x, cmp)).toBe(14);
    expect(lowerBound(dup, 8, (x) => x, cmp)).toBe(14);
    expect(lowerBound(dup, 9, (x) => x, cmp)).toBe(14);
    // search duplicate items
    expect(lowerBound(dup, 2, (x) => x, cmp)).toBe(3);
    expect(lowerBound(dup, 3, (x) => x, cmp)).toBe(9);
});
