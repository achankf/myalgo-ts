import { IMapReadonly } from "../map/mapIter";
import { AdjacencyList } from "./def";

/**
 * All-pair shortest paths, Floyd-Warshall algorithm
 * @see https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
export class FloydWarshall<T> {

    private nextMap: number[][];
    private verticesIdx: IMapReadonly<T, number>; // a glue b/w this.nextMap and this.vertices
    private vertices: T[];

    constructor(
        graph: AdjacencyList<T>,
        weight: (u: T, v: T) => number,
    ) {
        /*
        let dist be a |V| * |V| array of minimum distances initialized to Infinity
        let next be a |V| * |V| array of vertex indices initialized to null

        procedure FloydWarshallWithPathReconstruction ()
        for each edge (u,v)
            dist[u][v] ← w(u,v)  // the weight of the edge (u,v)
            next[u][v] ← v
        for k from 1 to |V| // standard Floyd-Warshall implementation
            for i from 1 to |V|
                for j from 1 to |V|
                    if dist[i][j] > dist[i][k] + dist[k][j] then
                    dist[i][j] ← dist[i][k] + dist[k][j]
                    next[i][j] ← next[i][k]
        */
        this.vertices = [...graph.keys()];
        this.verticesIdx = new Map(Array
            .from(this.vertices)
            .map((v, i): [T, number] => [v, i]));

        const vSize = graph.size;

        const dist = new Array<number[]>(vSize);

        // note: next is a reference to this.nextMap, which is a reference to a newly allocated array
        const next = this.nextMap = new Array<number[]>(vSize);

        for (let i = 0; i < vSize; i++) {
            dist[i] = new Array(vSize).fill(Infinity);
            next[i] = new Array(vSize);
            dist[i][i] = 0;
        }

        for (const [u, vs] of graph) {
            for (const v of vs) {
                const uIdx = this.verticesIdx.get(u)!;
                const vIdx = this.verticesIdx.get(v)!;
                dist[uIdx][vIdx] = weight(u, v);
                next[uIdx][vIdx] = vIdx;
            }
        }

        for (let k = 0; k < vSize; k++) {
            for (let i = 0; i < vSize; i++) {
                for (let j = 0; j < vSize; j++) {
                    const distIncludeK = dist[i][k] + dist[k][j];
                    if (dist[i][j] > distIncludeK) {
                        dist[i][j] = distIncludeK;
                        next[i][j] = next[i][k];
                    }
                }
            }
        }
    }

    public next(u: T, v: T) {
        const vIdx = this.verticesIdx.get(v)!;
        const uIdx = this.verticesIdx.get(u)!;
        const nextIdx = this.nextMap[uIdx][vIdx];
        if (nextIdx !== undefined) {
            return this.vertices[nextIdx];
        }
        return undefined;
    }
}
