import { genBy } from "../iter";
import { randomGen } from "./randomGen";

test("base case (empty) without crashing", () => {
  const gen = randomGen(new Map<string, number>());
  for (let i = 0; i < 100; i++) {
    expect(gen()).toBeUndefined();
  }
});

test("base case (only 1 item)", () => {
  const gen = randomGen(new Map([["default", 1]]));
  expect(
    genBy(gen)
      .take(100)
      .every((x) => x === "default")
  ).toBeTruthy();
});

test("base case bad probs (negative)", () => {
  expect(() => {
    randomGen(
      new Map([
        ["bad", -0.1],
        ["bad2", 1.1],
      ])
    )();
  }).toThrow();
});

test("50% coin flips", () => {
  const head = "head";
  const tail = "tail";
  const gen = randomGen(
    new Map([
      [head, 0.5],
      [tail, 0.5],
    ])
  );
  expect(
    genBy(gen)
      .take(100)
      .every((x) => x === head || x === tail)
  ).toBeTruthy();
});
