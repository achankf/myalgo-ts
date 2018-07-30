import { sum } from "../numbers";
import { BiMap } from "./bimap";

test("basic", () => {
    const map = new BiMap<number, string>();
    expect(map.isEmpty).toBeTruthy();
    expect(map.get(234234)).toBeUndefined();
    expect(map.getLeft("234234")).toBeUndefined();

    map.set(1, "hello");
    expect(map.has(1)).toBeTruthy();
    expect(map.hasRight("hello")).toBeTruthy();
});

test("more", () => {
    const map = new BiMap([24, "tom"], [48, "timmy"]);
    expect(map.size).toBe(2);
    expect(map.get(24)).toBe("tom");
    expect(map.get(48)).toBe("timmy");

    map.set(1, "hello");
    expect(map.has(1)).toBeTruthy();
    expect(map.hasRight("hello")).toBeTruthy();

    // test iterator
    let leftAcc = 0;
    let rightAcc = "";
    for (const [left, right] of map) {
        leftAcc += left;
        rightAcc += right;
    }

    expect(leftAcc).toBe(sum(...map.keys()));
    expect(rightAcc).toBe(Array.from(map.values()).join(""));

    // test delete
    expect(map.size).toBe(3);
    expect(map.has(24)).toBeTruthy();
    expect(map.hasRight("tom")).toBeTruthy();
    expect(map.delete(24)).toBeTruthy();
    expect(map.has(24)).toBeFalsy();
    expect(map.hasRight("tom")).toBeFalsy();
    expect(map.size).toBe(2);
    expect(map.delete(24)).toBeFalsy();
    expect(map.size).toBe(2);

    // test deleteRight
    expect(map.has(48)).toBeTruthy();
    expect(map.hasRight("timmy")).toBeTruthy();
    expect(map.deleteRight("timmy")).toBeTruthy();
    expect(map.size).toBe(1);
    expect(map.has(48)).toBeFalsy();
    expect(map.hasRight("timmy")).toBeFalsy();
    expect(map.deleteRight("timmy")).toBeFalsy();
    expect(map.size).toBe(1);
});
