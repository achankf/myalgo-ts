import { cmpList } from "../comparison/cmpList";
import { isSorted } from "../comparison/isSorted";
import { SortedTrie } from "./sortedTrie";

const cmp1 = (a: number, b: number) => a - b;

test("base case", () => {
    const t = new SortedTrie<number, number[], boolean>(cmp1);
    expect(t.isEmpty).toBeTruthy();
    expect(t.size).toBe(0);
});

test("base case", () => {
    const t = new SortedTrie<number, number[], boolean>(cmp1);
    expect(t.isEmpty).toBeTruthy();
    expect(t.size).toBe(0);

    const list1 = [1, 2, 3, 4, 5, 6, 7, 8];
    t.set(list1, true);
    expect(t.has(list1)).toBeTruthy();
    expect(t.get(list1)).toBeTruthy();

    const list2 = list1.reverse();
    expect(t.has(list2)).toBeTruthy();
    expect(t.get(list2)).toBeTruthy();

    expect(t.delete(list2)).toBeTruthy();
    expect(t.has(list1)).toBeFalsy();
});

test("sortedness", () => {

    const input1: Array<[number[], number]> = [
        [[1], 2],
        [[1, 2, 3, 4], 5],
        [[1, 2, 3], 1],
        [[], 12],
        [[7], 24],
        [[7, 6], 99],
        [[67, 9, 765, 8], 123],
    ];

    const t = new SortedTrie(cmp1, ...input1);
    expect(isSorted(t.keys(), (a, b) => cmpList(cmp1, a, b))).toBeTruthy(); // keys are sorted
    expect(t.keys().every((key) => isSorted(key, cmp1))).toBeTruthy(); // items in each key are also sorted
});
