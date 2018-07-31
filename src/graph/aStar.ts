import { MinHeap } from "../array/minheap";
import { makePair } from "../tuple";
import { AdjacencyList } from "./def";

/**
 * The A* pathfinding algorithm. If "to" is left undefined,
 * this method act as Dijkstra's algorithm, searching for all destinations from a single source.
 * @param vertices The set of vertices
 * @param neighbours The neighbours of a given vertex
 * @param weight The weight function, distance from vertex u to vertex v.
 * @param source The source
 * @param destination The destination, if any
 * @param heuristic The heuristic function for A*
 */
export function aStar<T>(
    vertices: Set<T>,
    neighbours: (t: T) => T[],
    weight: (u: T, v: T) => number,
    source: T,
    destination?: T,
    heuristic: (u: T, v: T) => number = () => 0,
): { distance: Map<T, number>, parent: Map<T, T> } | undefined {
    /*
    modified from https://www.redblobgames.com/pathfinding/a-star/introduction.html
        frontier = PriorityQueue()
        frontier.put(start, 0)
        came_from = {}
        cost_so_far = {}
        came_from[start] = None
        cost_so_far[start] = 0

        while not frontier.empty():
        current = frontier.get()

        if current == goal:
            break

        for next in graph.neighbors(current):
            new_cost = cost_so_far[current] + graph.cost(current, next)
            if next not in cost_so_far or new_cost < cost_so_far[next]:
                cost_so_far[next] = new_cost
                priority = new_cost + heuristic(goal, next)
                frontier.put(next, priority)
                came_from[next] = current
    */

    if (!vertices.has(source)) {
        throw new Error("source is not a node in the graph");
    }

    if (destination !== undefined && !vertices.has(destination)) {
        throw new Error("destination is not a node in the graph");
    }

    if (source === destination) {
        console.assert(false, "source and destination are the same, what are you searching for?");
        return undefined;
    }

    const distance = new Map<T, number>([[source, 0]]);
    const parent = new Map<T, T>();

    const frontier = MinHeap.heapify(([, a], [, b]) => a - b, makePair(source, 0));

    while (!frontier.isEmpty) {
        const [cur] = frontier.pop()!;
        if (destination !== undefined && cur === destination) {
            return { distance, parent };
        }

        for (const next of neighbours(cur)) {
            const oldDist = distance.get(next);
            const curDist = distance.get(cur)!;
            console.assert(curDist !== undefined);

            const partDistance = weight(cur, next);
            console.assert(partDistance !== undefined);
            if (partDistance <= 0) {
                throw new Error("weight must be positive (for progress to happen)");
            }
            const newDist = curDist + partDistance;

            if (oldDist !== undefined && newDist >= oldDist) {
                continue;
            }

            distance.set(next, newDist);
            const estimate = destination !== undefined ? heuristic(destination, next) : 0;

            if (estimate < 0) {
                throw new Error("heuristic estimate should be non-negative");
            }

            const priority = newDist + estimate;
            frontier.add([next, priority]);
            parent.set(next, cur);
        }
    }

    // return something when doing all-destination search
    if (destination === undefined) {
        return { distance, parent };
    }

    // reach here when doing single-destination search but not found the destination
    return undefined;
}

/**
 * The A* pathfinding algorithm. If "to" is left undefined,
 * this method act as Dijkstra's algorithm, searching for all destinations from a single source.
 * @param graph The graph as adjacency list.
 * @param weight The weight function, distance from vertex u to vertex v.
 * @param source The source
 * @param destination The destination, if any
 * @param heuristic The heuristic function for A*
 */
export function aStarAdjList<T>(
    graph: AdjacencyList<T>,
    weight: (u: T, v: T) => number,
    source: T,
    destination?: T,
    heuristic: (u: T, v: T) => number = () => 0,
) {
    return aStar(
        new Set(graph.keys()),
        (u) => {
            const edges = graph.get(u);
            if (edges === undefined) {
                throw new Error("Inconsistent graph -- graph should at least have an empty array for every vertices");
            }
            return edges;
        },
        weight, source, destination, heuristic);
}

export function extractPath<T>(parent: Map<T, T>, source: T, destination: T) {
    let cur = destination;
    const ret: T[] = [];

    if (parent.get(cur) === undefined) {
        return undefined;
    }

    while (true) {
        ret.push(cur);
        if (cur === source) {
            return ret;
        }
        cur = parent.get(cur)!;
        if (cur === undefined) {
            return undefined; // no valid path
        }
    }
}
