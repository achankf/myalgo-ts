import { arrayEqual } from "../comparison/equality";
import { Trie } from "./trie";

function compareTrieWithInput<KeyT extends any[], ValT>(
    input: Array<[KeyT, ValT]>,
    trie: Trie<KeyT, ValT>) {

    expect(trie.size()).toBe(input.length);

    for (const [key, value] of input) {
        const got = trie.get(key);
        expect(got).toBe(value);
    }

    for (const [key, value] of trie) {
        const [, got] = input.find(([key2]) => arrayEqual((a, b) => a === b ? 0 : undefined, key, key2))!;
        expect(got).toBe(value);
    }
}

test("base case", () => {
    const t = new Trie<[number, number], boolean>();
    expect(t.isEmpty()).toBeTruthy();
    expect(t.size()).toBe(0);
});

test("small list", () => {

    const input1: Array<[Array<number | string>, number]> = [
        [[1], 2],
        [[1, 2, 3, 4], 5],
        [[1, 2, 3], 1],
        [[], 12],
        [[7], 24],
        [[7, 6], 99],
        [["abc", 9, "a", 8], 123],
    ];

    const t = new Trie(...input1);
    expect(t.get([1, 2, 3, 4])).toBe(5);
    expect(t.get([1, 2, 3])).toBe(1);
    expect(t.get([1])).toBe(2);
    expect(t.get([])).toBe(12);
    expect(t.get([7])).toBe(24);
    expect(t.get([7, 6])).toBe(99);
    expect(t.get([4])).toBeUndefined();
    expect(t.get([1, 2])).toBeUndefined();
    expect(t.get(["abc", 9, "a", 8])).toBe(123);
    expect(t.get(["a"])).toBeUndefined();

    compareTrieWithInput(input1, t);

    expect(t.size()).toBe(7);
    expect(t.getFanout([])).toBe(3); // 1, 7, "abc"
    expect(t.delete([])).toBeTruthy();
    expect(t.size()).toBe(6);
    expect(t.getFanout([])).toBe(3); // 1, 7, "abc"
    expect(t.delete([1])).toBeTruthy();
    expect(t.size()).toBe(5);
    expect(t.getFanout([])).toBe(3); // 1, 7, "abc"
    expect(t.getFanout([1])).toBe(1); // 2
    expect(t.delete([1, 2, 3])).toBeTruthy();
    expect(t.size()).toBe(4);
    expect(t.getFanout([1])).toBe(1); // 2
    expect(t.delete([1, 2, 3, 4])).toBeTruthy();
    expect(t.size()).toBe(3);
    expect(t.getFanout([])).toBe(2); // 7, "abc"
    expect(t.getFanout([1])).toBe(0);
    expect(!t.delete([1, 2, 3, 4])).toBeTruthy();
    expect(t.size()).toBe(3);
    expect(!t.delete(["abc"])).toBeTruthy();
    expect(t.size()).toBe(3);
});
