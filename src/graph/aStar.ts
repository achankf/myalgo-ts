import { MinHeap } from "../array/minheap";
import { makePair } from "../tuple";
import { AdjacencyList } from "./def";

/**
 * The A* pathfinding algorithm. If "to" is left undefined,
 * this method act as Dijkstra's algorithm, searching for all destinations from a single source.
 * @param graph The graph as adjacency list.
 * @param weight The weight function, distance from vertex u to vertex v.
 * @param source The source
 * @param destination The destination, if any
 * @param heuristic The heuristic function for A*
 */
export function aStar<T>(
    graph: AdjacencyList<T>,
    weight: (u: T, v: T) => number,
    source: T,
    destination?: T,
    heuristic: (u: T, v: T) => number = () => 0,
): Map<T, T> {
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

    console.assert(source !== destination, "source and destination are the same, what are you searching for?");

    if (graph.get(source) === undefined) {
        throw new Error("source is not a node in the graph");
    }

    if (destination !== undefined && graph.get(destination) === undefined) {
        throw new Error("destination is not a node in the graph");
    }

    const dist = new Map<T, number>([[source, 0]]);
    const parent = new Map<T, T>();

    const frontier = MinHeap.heapify(([, a], [, b]) => a - b, makePair(source, 0));

    while (!frontier.isEmpty) {
        const [cur] = frontier.pop()!;
        if (destination !== undefined && cur === destination) {
            break;
        }

        const nexts = graph.get(cur);
        if (nexts === undefined) {
            throw new Error("inconsistent graph -- a vertex appear in edges but is not a key of the adjacency list");
        }

        for (const next of nexts) {
            const oldDist = dist.get(next);
            const curDist = dist.get(cur)!;
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

            dist.set(next, newDist);
            const estimate = destination !== undefined ? heuristic(destination, next) : 0;

            if (estimate < 0) {
                throw new Error("heuristic estimate should be non-negative");
            }

            const priority = newDist + estimate;
            frontier.add([next, priority]);
            parent.set(next, cur);
        }
    }
    return parent;
}

export function extractPath<T>(path: Map<T, T>, source: T, destination: T) {
    let cur = destination;
    const ret: T[] = [];

    if (path.get(cur) === undefined) {
        return undefined;
    }

    while (true) {
        ret.push(cur);
        if (cur === source) {
            return ret;
        }
        cur = path.get(cur)!;
        if (cur === undefined) {
            return undefined; // no valid path
        }
    }
}
