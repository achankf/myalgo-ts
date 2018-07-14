import { IMapReadonly } from "../map/mapIter";
import { sum } from "../numbers";

/**
 * Randomly generate items of type T given their probabilities (sum <= 1).
 * When the sum of probability < 1, it's possible to get undefined from the generator.
 * modified from https://stackoverflow.com/a/28933315
 * @param probs a map of objects and their probabilities
 */
export const randomGen = <T>(probs: IMapReadonly<T, number>, rand?: () => number) => {
    if (sum(...probs.values()) > 1) {
        throw new Error("probability needs to be positive and less than 1");
    }

    const results: T[] = [];
    const weights: number[] = [];
    for (const [key, p] of probs) {
        if (p <= 0) {
            throw new Error("probability needs to be positive and less than 1");
        }
        results.push(key);
        weights.push(p);
    }
    const randGen = rand === undefined ? Math.random : rand;
    return () => {
        const r = randGen();
        let cummulativeProbs = 0;
        for (let i = 0; i < weights.length; i++) {
            cummulativeProbs += weights[i];
            if (r < cummulativeProbs) {
                return results[i];
            }
        }

        return undefined;
    };
};

/**
 * The "strict" version of randomGen(), where sum of probabilities (with at least 1 remaining items) must sum up to 1.
 * @param remain the remain element will have a probability of 1-sum(probs) and remain ∉ probs
 * @param probs a map of objects and their probabilities
 */
export const randomGenStrict = <T>(
    remain: T, probs: IMapReadonly<T, number>,
    rand?: () => number,
) => {
    if (probs.has(remain)) {
        throw new Error("remain should ∉ probs");
    }
    const gen = randomGen(probs, rand);
    return () => {
        const ret = gen();
        return ret === undefined ? remain : ret;
    };
};
