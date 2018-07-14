import { listEqual } from "../comparison/cmpList";
import { UnionFind } from "./unionfind";

test("identity", () => {
    const set = new UnionFind<number>();
    expect(set.has(1)).toBeFalsy();
    expect(set.has(2)).toBeFalsy();
    expect(set.isSameSet(1, 1)).toBeTruthy();
    expect(set.isSameSet(2, 2)).toBeTruthy();
    expect(set.has(1)).toBeFalsy();
    expect(set.has(2)).toBeFalsy();
});

test("basic", () => {
    const set = new UnionFind<number>();
    expect(set.has(1)).toBeFalsy();
    expect(set.has(2)).toBeFalsy();
    expect(set.isSameSet(1, 2)).toBeFalsy();
    expect(set.isSameSet(2, 1)).toBeFalsy();
    expect(set.has(1)).toBeFalsy();
    expect(set.has(2)).toBeFalsy();
});

test("bipartite", () => {
    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];

    const set = new UnionFind<number>().union(...a).union(...b);

    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            expect(set.isSameSet(a[i], a[j])).toBeTruthy();
            expect(set.isSameSet(b[i], b[j])).toBeTruthy();
            expect(set.isSameSet(a[i], b[j])).toBeFalsy();
        }
    }
});

test("transitive", () => {
    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];

    const set = new UnionFind<number>().union(...a).union(...b);

    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            expect(set.isSameSet(a[i], a[j])).toBeTruthy();
            expect(set.isSameSet(b[i], b[j])).toBeTruthy();
            expect(set.isSameSet(a[i], b[j])).toBeFalsy();
        }
    }
});

test("clean up", () => {
    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];

    const set = new UnionFind<number>().union(...a).union(...b);

    set.tear(1, 2, 11);
    set.tear(1, 2, 11, 33);
    set.tear(1, 123123123); // only 1 gets splited

    expect(set.isSameSet(1, 2)).toBeFalsy();
    expect(set.isSameSet(3, 2)).toBeFalsy();
    expect(set.isSameSet(3, 4)).toBeTruthy();
    expect(set.isSameSet(11, 22)).toBeFalsy();
    expect(set.isSameSet(22, 33)).toBeFalsy();
    expect(set.isSameSet(22, 44)).toBeTruthy();
});

test("3 sets", () => {

    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];
    const c = [111, 222, 333, 444];

    const set = new UnionFind<number>().union(...a).union(...b).union(...c);

    set.union(1, 11);
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            expect(set.isSameSet(a[i], a[j])).toBeTruthy();
            expect(set.isSameSet(b[i], b[j])).toBeTruthy();
            expect(set.isSameSet(a[i], b[j])).toBeTruthy();
        }
    }
    expect(set.isSameSet(1, 111)).toBeFalsy();
    expect(set.isSameSet(1, 222)).toBeFalsy();
    expect(set.isSameSet(1, 333)).toBeFalsy();
    expect(set.isSameSet(1, 444)).toBeFalsy();
});

test("3 sets clean up", () => {

    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];
    const c = [111, 222, 333, 444];

    const set = new UnionFind<number>().union(...a).union(...b).union(...c);

    set.union(1, 11);
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            expect(set.isSameSet(a[i], a[j])).toBeTruthy();
            expect(set.isSameSet(b[i], b[j])).toBeTruthy();
            expect(set.isSameSet(a[i], b[j])).toBeTruthy();
        }
    }
    expect(set.isSameSet(1, 111)).toBeFalsy();
    expect(set.isSameSet(1, 222)).toBeFalsy();
    expect(set.isSameSet(1, 333)).toBeFalsy();
    expect(set.isSameSet(1, 444)).toBeFalsy();

    set.tear(1, 2, 3, 4, 5, 6); // effectively separating 1,2,3,4; ingore 5,6
    expect(set.isSameSet(1, 2)).toBeFalsy();
    expect(set.isSameSet(3, 2)).toBeFalsy();
    expect(set.isSameSet(3, 4)).toBeFalsy();
    expect(set.isSameSet(11, 22)).toBeTruthy();
    set.tear(11);
    expect(set.isSameSet(22, 11)).toBeFalsy();
    expect(set.isSameSet(33, 22)).toBeTruthy();
    set.tear(22);
    expect(set.isSameSet(22, 33)).toBeFalsy();
    set.tear(111, 222, 333, 444, 11, 22);
});

test("iterator", () => {

    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];
    const c = [111, 222, 333, 444];

    const set = new UnionFind<number>().union(...a).union(...b).union(...c);

    // test map()
    const totalSize = set
        .map((ts) => ts.size)
        .reduce((acc, x) => acc + x, 0);
    expect(totalSize).toBe(set.size());

    // test reduce()
    const totalSize2 = set.reduce((acc, ts) => acc + ts.size, 0);
    expect(totalSize).toBe(totalSize2);

    // test every()
    const allSize4 = set.every((ts) => ts.size === 4);
    expect(allSize4).toBeTruthy();

    // test some()
    const some444 = set.some((ts) => ts.has(444));
    expect(some444).toBeTruthy();

    // test some()
    const oneTwoThreeFour = 1234;
    const notSome1234 = set.some((ts) => ts.has(oneTwoThreeFour));
    expect(notSome1234).toBeFalsy();
    expect(notSome1234).toBe(set.has(oneTwoThreeFour));
});

test("get", () => {

    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];
    const c = [111, 222, 333, 444];

    const set = new UnionFind<number>().union(...a).union(...b).union(...c);

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(1)).sort(),
            a)).toBeTruthy();

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(11)).sort(),
            b)).toBeTruthy();

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(111)).sort(),
            c)).toBeTruthy();
});

test("deleteSets", () => {

    const a = [1, 2, 3, 4];
    const b = [11, 22, 33, 44];
    const c = [111, 222, 333, 444];

    const set = new UnionFind<number>().union(...a).union(...b).union(...c);

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(1)).sort(),
            a)).toBeTruthy();

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(11)).sort(),
            b)).toBeTruthy();

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(111)).sort(),
            c)).toBeTruthy();

    set.deleteSets(1, 111);

    expect(a.every((t) => !set.has(t))).toBeTruthy();
    expect(c.every((t) => !set.has(t))).toBeTruthy();

    expect(
        listEqual((x, y) => x - y,
            Array.from(set.get(11)).sort(),
            b)).toBeTruthy();
});
