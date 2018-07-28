import { isSorted } from "../comparison/isSorted";
import { genBy } from "../iter";
import { SortedList } from "./sortedList";

const cmp = (a: number, b: number) => a - b;
const cmp2 = (a: number, b: number) => b - a;

test("base case (empty)", () => {
    const ret = new SortedList((t: number) => t, cmp);
    expect(ret.getAt(123)).toBeUndefined();
    expect(ret.left(123).isEmpty).toBeTruthy();
    expect(ret.right(123).isEmpty).toBeTruthy();

    ret.delete(123);
    ret.deleteAt(0);
});

test("base case (empty)", () => {
    const ret = new SortedList((t: number) => t, cmp);
    ret.add(123);
    expect(ret.has(123)).toBeTruthy();
    ret.add(1, 1);
    expect(ret.has(1)).toBeTruthy();
    ret.add(2);
    expect(ret.has(2)).toBeTruthy();
});

test("test", () => {
    let ret = new SortedList((t: number) => t, cmp);
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 22, 6, 7, 8, 9];
    ret = ret.add(-1);
    ret = ret.add(...input);
    ret = ret.add(4567);

    expect(ret.size === input.length + 2);
    expect(isSorted(ret, cmp)).toBeTruthy();

    const right22 = ret.right(22);
    expect(right22.size).toBe(2);
    expect(right22.getAt(0)).toBe(22);
    expect(right22.getAt(1)).toBe(4567);

    const right1 = ret.right(1);
    expect(right1.size).toBe(ret.size - 1);
    expect(right1.every((x) => x !== -1)).toBeTruthy();

    expect(ret.left(6).size).toBe(8); // [-1, 1, 2, 3, 4, 5, 6, 6]
    expect(ret.right(6).size).toBe(9); // [6, 6, 7, 7, 8, 8, 9, 22, 4567]

    const no6 = ret.clone().delete(6);
    expect(no6.size).toBe(ret.size - 2);
    expect(no6.has(6)).toBeFalsy();

    const two6 = no6.clone().add(6).add(6);
    expect(two6.size).toBe(ret.size);
    expect(two6.getAt(6)).toBe(6);
    expect(two6.getAt(7)).toBe(6);

    two6.deleteAt(6);
    expect(two6.getAt(5)).toBe(5);
    expect(two6.getAt(6)).toBe(6);
    expect(two6.getAt(7)).toBe(7);
});

test("merge", () => {
    genBy((i) => i % 2 ? i : 0);
    genBy((i) => i % 2 ? 0 : i);

    const len = 100;
    const list1 = SortedList.wrap(genBy((i) => i % 2 ? i : 0).take(len), (t) => t, cmp);
    expect(list1.size).toBe(len);
    expect(list1.left(0).count()).toBe(50);

    const list2 = SortedList.wrap(genBy((i) => i % 2 ? 0 : i).take(len), (t) => t, cmp2);
    expect(list2.size).toBe(len);

    const list11 = list1.clone().add(...list2);
    expect(list11.size).toBe(2 * len);
    expect(isSorted(list11, cmp)).toBeTruthy();

    const list22 = list2.clone().add(...list1);
    expect(list22.size).toBe(2 * len);
    expect(isSorted(list22, cmp2)).toBeTruthy();

    // 200 zeroes, [1,200]
    const list3 = list11.clone().add(...list22);
    expect(isSorted(list3, cmp)).toBeTruthy();
    expect(list3.size).toBe(4 * len);

    {
        const r = list3.range(55, 80)!;
        expect(r).toBeDefined();
        const [low, high] = r;

        // list 3 should have 200 zeroes, and double of each 0 to 99 (hence *2 on the right-hand side)
        expect(high - low + 1).toBe((80 - 55 + 1) * 2);
    }
    {
        const r = list3.search(0)!;
        expect(r).toBeDefined();
        const [low, high] = r;
        expect(high - low + 1).toBe(list3.left(0).count());
    }
});
