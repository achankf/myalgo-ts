import { listEqual } from "../comparison/cmpList";
import { Trie } from "../map/trie";
import { aStar, extractPath } from "./aStar";

test("base case (bad arguments)", () => {

    // bad source
    expect(() => aStar<number>(new Map(), () => 1, 0)).toThrow();

    // bad destination
    expect(() => aStar<number>(new Map([
        [0, [1]],
        [1, []],
    ]), () => 1, 0, 100)).toThrow();

    // inconsistent graph
    expect(() => aStar<number>(new Map([[0, [1]]]), () => 1, 0)).toThrow();

    // non-positive weight
    expect(() => aStar<number>(new Map([
        [0, [1]],
        [1, []],
    ]), () => -1, 0)).toThrow();
    expect(() => aStar<number>(new Map([
        [0, [1]],
        [1, []],
    ]), () => 0, 0)).toThrow();

    // negative heuristic estimate
    expect(() => aStar<number>(new Map([
        [0, [1]],
        [1, []],
    ]), () => 1, 0, 1, () => -1)).toThrow();
});

test("base case (simple reachable)", () => {

    const graph = new Map([
        [0, [1]],
        [1, [0]],
    ]);

    const search1 = aStar<number>(graph, () => 1, 0, 1);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search1, 0, 1)!,
            [1, 0],
        )).toBeTruthy();

    const search2 = aStar<number>(graph, () => 1, 1, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search2, 1, 0)!,
            [0, 1],
        )).toBeTruthy();
});

test("base case (simple unreachable)", () => {

    const search = aStar<number>(new Map([
        [0, [1]],
        [1, []],
    ]), () => 1, 1, 0);

    expect(extractPath(search, 1, 0)).toBeUndefined();
});

test("base case (same source-destination)", () => {

    const graph = new Map([
        [0, [1]],
        [1, []],
    ]);

    // not an error, but you'll get an assertion error in debug mode
    const sourceDest = 1;
    const search = aStar<number>(graph, () => 1, sourceDest, sourceDest);

    expect(extractPath(search, sourceDest, sourceDest)).toBeUndefined(); // no path needed
});

test("uniform cost", () => {

    const graph = new Map([
        [0, [1, 2, 3, 5]],
        [1, [4]],
        [2, [1, 4]],
        [3, [3, 5]],
        [4, []],
        [5, [0]],
    ]);

    const search = aStar<number>(graph, () => 1, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 5)!,
            [5, 0],
        )).toBeTruthy();

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 4)!,
            [4, 1, 0],
        )
        ||
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 4)!,
            [4, 2, 0],
        )).toBeTruthy();
});

test("Dijkstra", () => {

    const graph = new Map([
        [0, [1, 2, 3, 5]],
        [1, [4]],
        [2, [1, 4]],
        [3, [1, 3, 5]],
        [4, []],
        [5, [0]],

        // another disconnected component
        [6, [7]],
        [7, [6]],
    ]);

    const weightTrie = new Trie<[number, number], number>(
        [[0, 1], 10],
        [[0, 2], 2],
        [[0, 3], 4],
        [[0, 4], 1],
        [[0, 5], 100],
        [[1, 4], 50],
        [[2, 1], 1],
        [[2, 4], 1],
        [[3, 1], 1],
        [[3, 3], 0.1], // weight must be positive
        [[3, 5], 1],
        [[5, 0], 1],
        [[6, 7], 1],
        [[7, 6], 1],
    );

    const weight = (u: number, v: number) => {
        const ret = weightTrie.get([u, v]);
        if (ret === undefined) {
            throw new Error("weight isn't set up properly");
        }
        return ret;
    };

    const search = aStar<number>(graph, weight, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 5)!,
            [5, 3, 0], // distance = 5, as oppose to [5,0] with distance of 100
        )).toBeTruthy();

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 4)!,
            [4, 2, 0], // distance = 3
        )).toBeTruthy();

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 3)!,
            [3, 0],
        )).toBeTruthy();

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(search, 0, 1)!,
            [1, 2, 0],
        )).toBeTruthy();

    const search2 = aStar<number>(graph, weight, 4);
    expect(extractPath(search2, 4, 1)).toBeUndefined();
    expect(extractPath(search2, 4, 2)).toBeUndefined();
    expect(extractPath(search2, 4, 3)).toBeUndefined();
    // searching for itself is ok, but you get an assertion error in debug mode
    expect(extractPath(search2, 4, 4)).toBeUndefined();
    expect(extractPath(search2, 4, 5)).toBeUndefined();
    expect(extractPath(search2, 4, 6)).toBeUndefined();
    expect(extractPath(search2, 4, 7)).toBeUndefined();

    const search3 = aStar<number>(graph, weight, 6);
    expect(extractPath(search3, 6, 1)).toBeUndefined();
    expect(extractPath(search3, 6, 2)).toBeUndefined();
    expect(extractPath(search3, 6, 3)).toBeUndefined();
    // searching for itself is ok, but you get an assertion error in debug mode
    expect(extractPath(search3, 6, 4)).toBeUndefined();
    expect(extractPath(search3, 6, 5)).toBeUndefined();
    expect(extractPath(search3, 6, 6)).toBeUndefined();
    expect(listEqual(
        (a, b) => a - b,
        extractPath(search3, 6, 7)!,
        [7, 6],
    )).toBeTruthy();
});

test("with heuristic (only test for reachability)", () => {

    const graph = new Map([
        [0, [1, 2, 3, 5]],
        [1, [4]],
        [2, [1, 4]],
        [3, [1, 3, 5]],
        [4, []],
        [5, [0]],

        // another disconnected component
        [6, [7]],
        [7, [6]],
    ]);

    const weightTrie = new Trie<[number, number], number>(
        [[0, 1], 10],
        [[0, 2], 2],
        [[0, 3], 4],
        [[0, 4], 1],
        [[0, 5], 100],
        [[1, 4], 50],
        [[2, 1], 1],
        [[2, 4], 1],
        [[3, 1], 1],
        [[3, 3], 0.1], // weight must be positive
        [[3, 5], 1],
        [[5, 0], 1],
        [[6, 7], 1],
        [[7, 6], 1],
    );

    const weight = (u: number, v: number) => {
        const ret = weightTrie.get([u, v]);
        if (ret === undefined) {
            throw new Error("weight isn't set up properly");
        }
        return ret;
    };

    // favor "small" vertices, but it doesn't since we're only interested in reachability
    const heuristic = (u: number, v: number) => u * v;

    function getPath(u: number, v: number) {
        const search = aStar<number>(graph, weight, u, v, heuristic);
        return extractPath(search, u, v);
    }

    expect(getPath(0, 1)).toBeDefined();
    expect(getPath(0, 2)).toBeDefined();
    expect(getPath(0, 3)).toBeDefined();
    expect(getPath(0, 5)).toBeDefined();
    expect(getPath(1, 4)).toBeDefined();
    expect(getPath(2, 1)).toBeDefined();
    expect(getPath(2, 4)).toBeDefined();
    expect(getPath(3, 1)).toBeDefined();
    expect(getPath(3, 5)).toBeDefined();
    expect(getPath(5, 0)).toBeDefined();
    expect(getPath(6, 7)).toBeDefined();
    expect(getPath(7, 6)).toBeDefined();
});
