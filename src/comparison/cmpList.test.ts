import { genBy } from "../iter";
import { cmpList } from "./cmpList";

const cmp1 = (a: number, b: number) => a - b;

test("base", () => {
    expect(cmpList(cmp1, [], [])).toBe(0);
    expect(cmpList(cmp1, [123], [])).toBeGreaterThan(0);
    expect(cmpList(cmp1, [], [123])).toBeLessThan(0);
    expect(cmpList(cmp1, [123], [123])).toBe(0);
});

test("long and short", () => {
    const short = genBy(() => Math.random()).take(100).collect();
    const long = short.concat(123, 42353, 67, 345, 2452, 234234, 134);
    expect(cmpList(cmp1, short, short)).toBe(0);
    expect(cmpList(cmp1, long, long)).toBe(0);
    expect(cmpList(cmp1, short, long)).toBeLessThan(0);
    expect(cmpList(cmp1, long, short)).toBeGreaterThan(0);
});

test("same size", () => {
    const list1 = genBy(() => Math.random()).take(100).collect();
    const list2 = list1.slice();
    list2[list2.length - 1] = 1000;
    expect(cmpList(cmp1, list1, list2)).toBeLessThan(0);
    expect(cmpList(cmp1, list2, list1)).toBeGreaterThan(0);
});
