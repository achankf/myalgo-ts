import { listEqual } from "../comparison/cmpList";
import { Trie } from "../map/trie";
import { aStarAdjList, extractPath } from "./aStar";

test("base case (bad source)", () => {
    expect(() => aStarAdjList(new Map(), () => 1, 0)).toThrow();
});

test("base case (bad destination)", () => {
    const graph = new Map(
        [
            [0, [1]],
            [1, []],
        ]);
    expect(() => aStarAdjList(graph, () => 1, 0, 100)).toThrow();
});

test("base case (inconsistent graph)", () => {
    const graph = new Map(
        [
            [0, [1]],
        ]);
    expect(() => aStarAdjList(graph, () => 1, 0)).toThrow();
});

test("base case (non-positive weight)", () => {
    const graph = new Map(
        [
            [0, [1]],
            [1, []],
        ]);
    expect(() => aStarAdjList(graph, () => -1, 0)).toThrow();
});

test("base case (negative heuristic estimate)", () => {
    const graph = new Map([
        [0, [1]],
        [1, []],
    ]);
    expect(() => aStarAdjList(graph, () => 1, 0, 1, () => -1)).toThrow();
});

test("base case (simple reachable)", () => {

    const graph = new Map([
        [0, [1]],
        [1, [0]],
    ]);

    const { parent: parent1 } = aStarAdjList(graph, () => 1, 0, 1);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent1, 0, 1)!,
            [1, 0],
        )).toBeTruthy();

    const { parent: parent2 } = aStarAdjList(graph, () => 1, 1, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent2, 1, 0)!,
            [0, 1],
        )).toBeTruthy();
});

test("base case (simple unreachable)", () => {

    const { parent } = aStarAdjList(new Map([
        [0, [1]],
        [1, []],
    ]), () => 1, 1, 0);

    expect(extractPath(parent, 1, 0)).toBeUndefined();
});

test("base case (same source-destination)", () => {

    const graph = new Map([
        [0, [1]],
        [1, []],
    ]);

    // not an error, but you'll get an assertion error in debug mode
    const sourceDest = 1;
    const { parent } = aStarAdjList(graph, () => 1, sourceDest, sourceDest);

    expect(extractPath(parent, sourceDest, sourceDest)).toBeUndefined(); // no path needed
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

    const { distance, parent } = aStarAdjList(graph, () => 1, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 5)!,
            [5, 0],
        )).toBeTruthy();
    expect(distance.get(0)).toBe(0);
    expect(distance.get(5)).toBe(1);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 4)!,
            [4, 1, 0],
        )
        ||
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 4)!,
            [4, 2, 0],
        )).toBeTruthy();
    expect(distance.get(4)).toBe(2);
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

    const { distance, parent } = aStarAdjList(graph, weight, 0);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 5)!,
            [5, 3, 0],
        )).toBeTruthy();
    expect(distance.get(5)).toBe(5);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 4)!,
            [4, 2, 0],
        )).toBeTruthy();
    expect(distance.get(4)).toBe(3);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 3)!,
            [3, 0],
        )).toBeTruthy();
    expect(distance.get(3)).toBe(4);

    expect(
        listEqual(
            (a, b) => a - b,
            extractPath(parent, 0, 1)!,
            [1, 2, 0],
        )).toBeTruthy();
    expect(distance.get(1)).toBe(3);

    const { parent: parent2 } = aStarAdjList(graph, weight, 4);
    expect(extractPath(parent2, 4, 1)).toBeUndefined();
    expect(extractPath(parent2, 4, 2)).toBeUndefined();
    expect(extractPath(parent2, 4, 3)).toBeUndefined();
    // searching for itself is ok, but you get an assertion error in debug mode
    expect(extractPath(parent2, 4, 4)).toBeUndefined();
    expect(extractPath(parent2, 4, 5)).toBeUndefined();
    expect(extractPath(parent2, 4, 6)).toBeUndefined();
    expect(extractPath(parent2, 4, 7)).toBeUndefined();

    const { parent: parent3 } = aStarAdjList<number>(graph, weight, 6);
    expect(extractPath(parent3, 6, 1)).toBeUndefined();
    expect(extractPath(parent3, 6, 2)).toBeUndefined();
    expect(extractPath(parent3, 6, 3)).toBeUndefined();
    // searching for itself is ok, but you get an assertion error in debug mode
    expect(extractPath(parent3, 6, 4)).toBeUndefined();
    expect(extractPath(parent3, 6, 5)).toBeUndefined();
    expect(extractPath(parent3, 6, 6)).toBeUndefined();
    expect(listEqual(
        (a, b) => a - b,
        extractPath(parent3, 6, 7)!,
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
        const { parent } = aStarAdjList(graph, weight, u, v, heuristic);
        return extractPath(parent, u, v);
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
