import { isSorted } from "../comparison/isSorted";
import { genBy } from "../iter";
import { MinHeap } from "./minheap";

const cmp = (a: number, b: number) => a - b;

function checkEmpty<T>(heap: MinHeap<T>) {
    expect(heap.peek()).toBeUndefined();
    expect(heap.peek()).toBeUndefined();
    expect(heap.isEmpty()).toBeTruthy();
    expect(heap.size()).toBe(0);
    expect(heap.pop()).toBeUndefined();
}

function random(len: number) {
    return genBy(() => Math.random()).take(len);
}

test("simple duplicates", () => {
    const heap = MinHeap.heapify(cmp, -1, -1, -2, -2, -3, -4, -4, -5, -6);
    expect(heap.pop()).toBe(-6);
    expect(heap.pop()).toBe(-5);
    expect(heap.pop()).toBe(-4);
    expect(heap.pop()).toBe(-4);
    expect(heap.pop()).toBe(-3);
    expect(heap.pop()).toBe(-2);
    expect(heap.pop()).toBe(-2);
    expect(heap.pop()).toBe(-1);
    expect(heap.pop()).toBe(-1);
    checkEmpty(heap);
});

test("heapify, pop, add", () => {
    const heap = MinHeap.heapify<number>(cmp, -1, -1, -2, -2, -3, -4, -4, -5, -6);
    expect(heap.pop()).toBe(-6);
    expect(heap.pop()).toBe(-5);
    expect(heap.pop()).toBe(-4);
    expect(heap.pop()).toBe(-4);
    expect(heap.pop()).toBe(-3);
    expect(heap.pop()).toBe(-2);
    expect(heap.pop()).toBe(-2);
    expect(heap.pop()).toBe(-1);
    expect(heap.pop()).toBe(-1);
    checkEmpty(heap);

    // DON'T DO THIS IN NORMAL CODES, use heapify()
    const len = 1234;
    for (const num of random(len)) {
        heap.add(num);
    }
    expect(heap.size()).toBe(len);
    expect(isSorted(heap, cmp)).toBeTruthy();
});

test("heapify, add, pop", () => {
    const base = [-1, -1, -2, -2, -3, -4, -4, -5, -6];
    const heap = MinHeap.heapify(cmp, ...base);

    // DON'T DO THIS IN NORMAL CODES, use heapify()
    const len = 1234;
    for (const num of random(len)) {
        heap.add(num);
    }
    expect(heap.size()).toBe(len + base.length);
    expect(isSorted(heap, cmp)).toBeTruthy();
});

test("add", () => {
    const heap = new MinHeap<number>(cmp);

    // DON'T DO THIS IN NORMAL CODES, use heapify()
    for (const num of random(1234)) {
        heap.add(num);
    }
    expect(isSorted(heap, cmp)).toBeTruthy();
});

test("(peek pop size empty) base case", () => {
    const heap = MinHeap.heapify(cmp);
    checkEmpty(heap);
});

test("peek pop size empty", () => {
    const len = 1234;
    const heap = MinHeap.heapify(cmp, ...random(len));
    expect(heap.isEmpty()).toBeFalsy();
    expect(heap.size()).toBe(len);

    heap.add(-1); // lowest number
    expect(heap.peek()).toBe(-1);
    expect(isSorted(heap, cmp)).toBeTruthy();
    expect(heap.peek()).toBe(-1);
    expect(heap.pop()).toBe(-1);

    for (let i = 0; i < len; i++) {
        expect(heap.pop()).toBeGreaterThanOrEqual(0);
    }
    checkEmpty(heap);
});

test("sort", () => {
    const len = 1234;
    const heap = MinHeap.heapify(cmp, ...random(len));
    expect(heap.isEmpty()).toBeFalsy();
    expect(heap.size()).toBe(len);

    heap.add(-1); // lowest number
    expect(heap.peek()).toBe(-1);
    expect(isSorted(heap, cmp)).toBeTruthy();
    expect(heap.peek()).toBe(-1);
    expect(heap.pop()).toBe(-1);

    for (const n of heap.sort()) {
        expect(n).toBeGreaterThanOrEqual(0);
    }
});

test("reverseSort", () => {
    const len = 1234;
    const heap = MinHeap.heapify(cmp, ...random(len));
    expect(heap.isEmpty()).toBeFalsy();
    expect(heap.size()).toBe(len);

    heap.add(-1); // lowest number
    expect(heap.peek()).toBe(-1);
    expect(isSorted(heap, cmp)).toBeTruthy();
    expect(heap.peek()).toBe(-1);
    expect(heap.pop()).toBe(-1);
    const highToLow = heap.reverseSort();
    expect(isSorted(highToLow.reverse(), cmp));
    for (const n of highToLow) {
        expect(n).toBeGreaterThanOrEqual(0);
    }
});

test("in-place sort", () => {
    const len = 1234;
    const heap = MinHeap.heapify(cmp, ...random(len));
    expect(heap.isEmpty()).toBeFalsy();
    expect(heap.size()).toBe(len);

    heap.add(-1); // lowest number
    expect(heap.peek()).toBe(-1);
    expect(isSorted(heap, cmp)).toBeTruthy();
    expect(heap.peek()).toBe(-1);
    expect(heap.size()).toBe(len + 1);
    expect(heap.pop()).toBe(-1);
    expect(heap.size()).toBe(len);

    const lowToHigh = heap.sortInPlace();
    expect(lowToHigh.length).toBe(len);
    expect(isSorted(lowToHigh, cmp));
    for (const n of lowToHigh) {
        expect(n).toBeGreaterThanOrEqual(0);
    }
});
