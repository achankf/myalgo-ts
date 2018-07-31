import { genBy } from "../iter";
import { bfsPreOrder } from "./breadthFirstTraversal";

// note: you need at least 1 vertex to perform the search
test("base case (not crash on graph with 1 vertex)", () => {
    const list = Array.from(bfsPreOrder(0, () => []));
    expect(list.length).toBe(1);
    const [vertex, depth] = list[0];
    expect(vertex).toBe(0);
    expect(depth).toBe(0);
});

test("base case (directed cycle)", () => {
    const list = Array.from(bfsPreOrder(0, (i: number) => i === 0 ? [1] : [0]));
    expect(list.length).toBe(2);
    {
        const [vertex, depth] = list[0];
        expect(vertex).toBe(0);
        expect(depth).toBe(0);
    }

    {
        const [vertex, depth] = list[1];
        expect(vertex).toBe(1);
        expect(depth).toBe(1);
    }
});

test("linked list", () => {
    const len = 1000;
    const neighbours = (i: number) => i < len ? [i + 1] : [];
    const list = Array.from(bfsPreOrder(0, neighbours));
    expect(list.length).toBe(1001);

    const total = len + 1;
    for (let i = 0; i < total; i++) {
        const [vertex, depth] = list[i];
        expect(vertex).toBe(i);
        expect(depth).toBe(i);
    }
});

test("infinite linked list", () => {
    const neighbours = (i: number) => [i + 1];
    const list = bfsPreOrder(0, neighbours);

    const len = 1000;
    let j = 0;
    for (const [vertex, depth] of list) {
        if (j === len) {
            break; // this is enough to demonstrate the point
        }
        expect(vertex).toBe(j);
        expect(depth).toBe(j);
        ++j;
    }
    expect(j).toBe(len);
});

test("complete graph of order 1000", () => {

    const len = 1000;
    const oneToThousand = new Set(genBy((i) => i).take(len));

    const neighbours = (i: number) => {
        const clone = new Set(oneToThousand);
        clone.delete(i);
        return clone;
    };
    const list = Array.from(bfsPreOrder(0, neighbours));
    expect(list.length).toBe(len);
    expect((new Set(list)).size).toBe(len);
});
