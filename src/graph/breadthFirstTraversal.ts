/**
 * Breadth First, pre-order Traversal
 * @param root the root node
 * @param neighbours a function that return edges of a node
 * @param key turns a node into a unique value, needed if the neighbours
 *  are derived values instead of pointing to the actual nodes in the graph, then a key function must be provided.
 */
export function* bfsPreOrder<T>(
    root: T,
    neighbours: (vertex: T) => IterableIterator<T>,
): IterableIterator<[T, number]> {

    const workList: Array<[T, number]> = [[root, 0]];
    const visited = new Set<T>();

    while (workList.length > 0) {
        const [cur, depth] = workList.shift()!;
        yield [cur, depth];
        visited.add(cur);
        const depth1 = depth + 1;

        for (const nei of neighbours(cur)) {
            visited.add(nei);
            if (!visited.has(nei)) {
                workList.push([nei, depth1]);
            }
        }
    }
}
