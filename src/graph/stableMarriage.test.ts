import { IMapReadonly } from "../map/mapIter";
import { stableMarriage } from "./stableMarriage";

// Some tests were originally written when stableMarriage used to use a queue (with Array.shift)
// to hold a free men, but then I realize an array is just fine (with Array.pop). So, the comments
// below for the flow of the algorithm may look strange, since men who are rejected/replaced aren't
// immediately finding the next candidate (because they're in the end of the queue).

function printMarriage(marriage: IMapReadonly<string, number>) {
  console.log(
    Array.from(marriage)
      .sort(([, a], [, b]) => a - b)
      .map(([a, b]) => "[" + a + " " + b + "]")
      .join()
  );
}

function stableMarriageTest<Man, Woman>(
  men: Array<[Man, IMapReadonly<Woman, number>]>,
  women: Array<[Woman, IMapReadonly<Man, number>]>
) {
  const mapMen = new Map(
    men.map(([m, mMap]): [Man, (w: Woman) => number | undefined] => [
      m,
      (w: Woman) => mMap.get(w),
    ])
  );
  const mapWoman = new Map(
    women.map(([w, wMap]): [Woman, (m: Man) => number | undefined] => [
      w,
      (m: Man) => wMap.get(m),
    ])
  );
  return stableMarriage(mapMen, mapWoman);
}

test("base case (empty) without crashing", () => {
  const marriage = stableMarriage(new Map(), new Map());
  expect(marriage.size).toEqual(0);
});

test("base case (more man than woman) without crashing", () => {
  const marriage = stableMarriageTest([[1, new Map()]], []);
  expect(marriage.size).toEqual(0);
});

test("1 to 1", () => {
  const marriage = stableMarriageTest(
    [[1, new Map([["a", 1]])]],
    [["a", new Map([[1, 1]])]]
  );

  expect(marriage.get("a")).toEqual(1);
});

test("2 to 2, no switching", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 2],
          ["b", 1],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 2],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 2],
        ]),
      ],
    ]
  );

  expect(marriage.get("a")).toEqual(1);
  expect(marriage.get("b")).toEqual(2);
});

test("2 to 2, woman switch", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 2],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 2],
        ]),
      ],
    ]
  );

  // flow:
  // 1,b
  // 2,b (b switch because 2 has higher priority)
  // 1,a
  expect(marriage.get("a")).toEqual(1);
  expect(marriage.get("b")).toEqual(2);
});

test("not a complete bipartite graph (3 only has preference for a)", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
        ]),
      ],
      [3, new Map([["a", 4]])],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 2],
          [3, 3],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
        ]),
      ],
    ]
  );

  // flow:
  // 1,c
  // 2,a
  // 3 tried a, replaced 2
  // 2,b;
  expect(marriage.get("a")).toEqual(3);
  expect(marriage.get("b")).toEqual(2);
  expect(marriage.get("c")).toEqual(1);
});

test("not a complete bipartite graph (3 remains free)", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
        ]),
      ],
      [3, new Map([["a", 4]])],
    ],
    [
      [
        "a",
        new Map([
          [1, 100],
          [2, 2],
          [3, 1],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
        ]),
      ],
    ]
  );

  // flow:
  // 1,c
  // 2,a
  // 3 tried a, rejected
  expect(marriage.get("a")).toEqual(2);
  expect(marriage.get("c")).toEqual(1);
  expect(marriage.size === 2); // no b and 3 is free
});

test("not a complete bipartite graph (some people has no preference)", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
        ]),
      ],
      [3, new Map()],
    ],
    [
      ["a", new Map()],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
        ]),
      ],
    ]
  );

  // flow:
  // 1,c
  // 2 tried a, but rejected since a has no preference
  // 2 b
  // 3 has no preference
  expect(marriage.get("b")).toEqual(2);
  expect(marriage.get("c")).toEqual(1);
  expect(marriage.size === 2); // no b and 3 is free
});

test("preference in rational numbers (1->c, 2.001)", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 2.001],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
        ]),
      ],
      [3, new Map()],
    ],
    [
      ["a", new Map()],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
        ]),
      ],
    ]
  );

  // flow:
  // 1,c
  // 2 tried a, but rejected since a has no preference
  // 2 b
  // 3 has no preference
  expect(marriage.get("b")).toEqual(2);
  expect(marriage.get("c")).toEqual(1);
  expect(marriage.size === 2); // no b and 3 is free
});

test("more women than men", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
          ["d", 4],
          ["e", 5],
          ["f", 6],
          ["g", 7],
          ["h", 1],
          ["i", 8],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
          ["d", 1],
          ["e", 7],
          ["f", 8],
          ["g", 4],
          ["h", 1],
          ["i", 2],
        ]),
      ],
      [
        3,
        new Map([
          ["a", 4],
          ["b", 2],
          ["c", 1],
          ["d", 8],
          ["e", 6],
          ["f", 7],
          ["g", 5],
          ["h", 1],
          ["i", 3],
        ]),
      ],
      [
        4,
        new Map([
          ["a", 8],
          ["b", 2],
          ["c", 3],
          ["d", 7],
          ["e", 1],
          ["f", 5],
          ["g", 4],
          ["h", 1],
          ["i", 6],
        ]),
      ],
      [
        5,
        new Map([
          ["a", 1],
          ["b", 6],
          ["c", 2],
          ["d", 7],
          ["e", 3],
          ["f", 5],
          ["g", 4],
          ["h", 1],
          ["i", 8],
        ]),
      ],
      [
        6,
        new Map([
          ["a", 1],
          ["b", 6],
          ["c", 7],
          ["d", 2],
          ["e", 3],
          ["f", 5],
          ["g", 8],
          ["h", 1],
          ["i", 4],
        ]),
      ],
      [
        7,
        new Map([
          ["a", 5],
          ["b", 4],
          ["c", 7],
          ["d", 2],
          ["e", 6],
          ["f", 3],
          ["g", 8],
          ["h", 1],
          ["i", 1],
        ]),
      ],
      [
        8,
        new Map([
          ["a", 3],
          ["b", 7],
          ["c", 2],
          ["d", 1],
          ["e", 5],
          ["f", 6],
          ["g", 4],
          ["h", 1],
          ["i", 8],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
          [6, 6],
          [7, 7],
          [8, 8],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
          [4, 7],
          [5, 2],
          [6, 4],
          [7, 8],
          [8, 5],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
          [4, 2],
          [5, 1],
          [6, 6],
          [7, 8],
          [8, 7],
        ]),
      ],
      [
        "d",
        new Map([
          [1, 4],
          [2, 3],
          [3, 8],
          [4, 2],
          [5, 6],
          [6, 1],
          [7, 5],
          [8, 7],
        ]),
      ],
      [
        "e",
        new Map([
          [1, 6],
          [2, 1],
          [3, 7],
          [4, 8],
          [5, 5],
          [6, 4],
          [7, 2],
          [8, 3],
        ]),
      ],
      [
        "f",
        new Map([
          [1, 8],
          [2, 6],
          [3, 7],
          [4, 3],
          [5, 5],
          [6, 2],
          [7, 1],
          [8, 4],
        ]),
      ],
      [
        "g",
        new Map([
          [1, 2],
          [2, 4],
          [3, 5],
          [4, 6],
          [5, 8],
          [6, 3],
          [7, 1],
          [8, 7],
        ]),
      ],
      [
        "h",
        new Map([
          [1, 6],
          [2, 5],
          [3, 1],
          [4, 3],
          [5, 7],
          [6, 2],
          [7, 8],
          [8, 4],
        ]),
      ],
      [
        "i",
        new Map([
          [1, 7],
          [2, 6],
          [3, 5],
          [4, 4],
          [5, 8],
          [6, 1],
          [7, 2],
          [8, 3],
        ]),
      ],
    ]
  );

  // flow -- simulating algorithm that process the free-men queue in this order (5,2,6,3,1,4,8,7):
  // 5 i
  // 2 f
  // 6 g
  // 3 d
  // 1 try i, rejected
  // 4 a
  // 8 try i, rejected
  // 7 try g, rejected
  // 1 try g, rejected
  // 8 b
  // 7 c
  // 1 try f, replace 2
  // 2 e

  printMarriage(marriage);

  // [1,f],[2,e],[3,d],[4,a],[5,i],[6,g],[7c],[8b]
  expect(marriage.get("a")).toBe(4);
  expect(marriage.get("b")).toBe(8);
  expect(marriage.get("c")).toBe(7);
  expect(marriage.get("d")).toBe(3);
  expect(marriage.get("e")).toBe(2);
  expect(marriage.get("f")).toBe(1);
  expect(marriage.get("g")).toBe(6);
  expect(marriage.get("h")).toBe(undefined);
  expect(marriage.get("i")).toBe(5);
});

test("more men than women", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
          ["d", 4],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 6],
          ["b", 5],
          ["c", 3],
          ["d", 1],
        ]),
      ],
      [
        3,
        new Map([
          ["a", 4],
          ["b", 2],
          ["c", 1],
          ["d", 8],
        ]),
      ],
      [
        4,
        new Map([
          ["a", 8],
          ["b", 2],
          ["c", 3],
          ["d", 7],
        ]),
      ],
      [
        5,
        new Map([
          ["a", 1],
          ["b", 6],
          ["c", 2],
          ["d", 7],
        ]),
      ],
      [
        6,
        new Map([
          ["a", 1],
          ["b", 6],
          ["c", 7],
          ["d", 2],
        ]),
      ],
      [
        7,
        new Map([
          ["a", 5],
          ["b", 4],
          ["c", 7],
          ["d", 2],
        ]),
      ],
      [
        8,
        new Map([
          ["a", 3],
          ["b", 7],
          ["c", 2],
          ["d", 1],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
          [6, 6],
          [7, 7],
          [8, 8],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 6],
          [3, 3],
          [4, 7],
          [5, 2],
          [6, 4],
          [7, 8],
          [8, 5],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 4],
          [2, 5],
          [3, 3],
          [4, 2],
          [5, 1],
          [6, 6],
          [7, 8],
          [8, 7],
        ]),
      ],
      [
        "d",
        new Map([
          [1, 4],
          [2, 3],
          [3, 8],
          [4, 2],
          [5, 6],
          [6, 1],
          [7, 5],
          [8, 7],
        ]),
      ],
    ]
  );

  // flow -- simulating algorithm that process the free-men queue in this order (5,2,6,3,1,4,8,7):
  // 5 d
  // 2 a
  // 6 c
  // 3 try d, replaced 5
  // 1 try d, rejected
  // 4 try a, replaced 2
  // 8 b
  // 7 try c, replaced 6
  // 5 try b, rejected
  // 1 try c, rejected
  // 2 try b, replaced 8
  // 6 try b, rejected
  // 5 try c, rejected
  // 1 try b, rejected
  // 8 try a, replaced 4
  // 6 try d, rejected
  // 5 try a, rejected, all candidates exhausted
  // 1 try a, rejected, all candidates exhausted
  // 4 try d, rejected
  // 6 try a, rejected, all candidates exhausted
  // 4 try c, rejected,
  // 4 try b, replaced 2
  // 2 try c, rejected
  // 2 try d, rejected, all candidates exhausted

  printMarriage(marriage);
  // [3,d],[4,b],[7,c],[8,a]

  expect(marriage.get("a")).toBe(8);
  expect(marriage.get("b")).toBe(4);
  expect(marriage.get("c")).toBe(7);
  expect(marriage.get("d")).toBe(3);
});

test("2 to 2, same ranking", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 1],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 1],
          ["b", 1],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 1],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 1],
        ]),
      ],
    ]
  );

  expect(marriage.get("a")).toEqual(1);
  expect(marriage.get("b")).toEqual(2);
});

test("4 to 4, 2 groups of same ranking", () => {
  const marriage = stableMarriageTest(
    [
      [
        1,
        new Map([
          ["a", 1],
          ["b", 1],
          ["c", 2],
          ["d", 2],
        ]),
      ],
      [
        2,
        new Map([
          ["a", 1],
          ["b", 1],
          ["c", 2],
          ["d", 2],
        ]),
      ],
      [
        3,
        new Map([
          ["a", 1],
          ["b", 1],
          ["c", 2],
          ["d", 2],
        ]),
      ],
      [
        4,
        new Map([
          ["a", 1],
          ["b", 1],
          ["c", 2],
          ["d", 2],
        ]),
      ],
    ],
    [
      [
        "a",
        new Map([
          [1, 1],
          [2, 1],
          [3, 2],
          [4, 2],
        ]),
      ],
      [
        "b",
        new Map([
          [1, 1],
          [2, 1],
          [3, 2],
          [4, 2],
        ]),
      ],
      [
        "c",
        new Map([
          [1, 1],
          [2, 1],
          [3, 2],
          [4, 2],
        ]),
      ],
      [
        "d",
        new Map([
          [1, 1],
          [2, 1],
          [3, 2],
          [4, 2],
        ]),
      ],
    ]
  );

  printMarriage(marriage);
  // [1 b],[2 a],[3 d],[4 c]

  // 4 c
  // 3 try c, rejected
  // 3 d
  // 2 try c, rejected
  // 2 try d, rejected
  // 2 a
  // 1 a, rejected
  // 1 b

  const a = marriage.get("a");
  const b = marriage.get("b");
  const c = marriage.get("c");
  const d = marriage.get("d");

  // note: xor
  expect((a === 1 || a === 2 || b === 1 || b === 2) && a !== b).toBeTruthy();
  expect((c === 3 || c === 4 || d === 3 || d === 4) && c !== d).toBeTruthy();
});
