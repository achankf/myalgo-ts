import { UnionFind } from "../set/unionfind";
import { AdjacencyList } from "./def";

/**
 * Minimum spanning tree, Kruskal's algorithm
 * @param vertices vertices
 * @param neighbours neighbours that forms an edge with a given vertex
 * @param weight the weight of each edge
 */
export function kruskalMST<T>(
  vertices: Set<T>,
  neighbours: (vertex: T) => IterableIterator<T>,
  weight: (u: T, v: T) => number
): AdjacencyList<T> {
  /*
    https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
    KRUSKAL(G):
    1 A = ∅
    2 foreach v ∈ G.V:
    3    MAKE-SET(v)
    4 foreach (u, v) in G.E ordered by weight(u, v), increasing:
    5    if FIND-SET(u) ≠ FIND-SET(v):
    6       A = A ∪ {(u, v)}
    7       UNION(u, v)
    8 return A
    */

  const sets = new UnionFind<T>();
  const edges = Array.from(vertices)
    .reduce((acc, u) => {
      for (const v of neighbours(u)) {
        acc.push([u, v]);
      }
      return acc;
    }, new Array<[T, T]>())
    .sort(([u1, v1], [u2, v2]) => weight(u1, v1) - weight(u2, v2)); // sort by weight on ascending order

  const ret = new Map(Array.from(vertices).map((v): [T, T[]] => [v, []]));

  for (const [u, v] of edges) {
    if (!sets.isSameSet(u, v)) {
      ret.get(u)!.push(v);
      ret.get(v)!.push(u);
      sets.union(u, v);
    }
  }

  return ret;
}
