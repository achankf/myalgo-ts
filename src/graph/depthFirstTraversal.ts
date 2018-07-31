import { toIt } from "../iter";

/**
 * Depth First, pre-order traversal
 * @param root the root node
 * @param neighbours a function that return edges of a node
 * @param isVisited a function that indicates whether a node is visited; optional if the graph is a tree
 * @param markVisited a function that marks a node as visited; optional if the graph is a tree
 */
export function dfsPreOrder<T>(
    root: T,
    neighbours: (vertex: T) => Iterable<T>,
) {
    return toIt(dfsPreOrderHelper(root, neighbours));
}

export function* dfsPreOrderHelper<T>(
    root: T,
    neighbours: (vertex: T) => Iterable<T>,
): Iterable<[T, number]> {
    const workList: Array<[T, number]> = [[root, 0]];
    const visited = new Set<T>();

    while (workList.length > 0) {
        const [cur, depth] = workList.pop()!;
        if (!visited.has(cur)) {
            yield [cur, depth];
            visited.add(cur);

            const depth1 = depth + 1;
            for (const nei of neighbours(cur)) {
                workList.push([nei, depth1]);
            }
        }
    }
}
