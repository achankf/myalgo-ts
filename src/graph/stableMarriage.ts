import { MinHeap } from "../array/minheap";
import { IMapReadonly } from "../map/mapIter";

function setupCandidates<Man, Woman>(
    men: IMapReadonly<Man, (woman: Woman) => number | undefined>,
    women: IMapReadonly<Woman, (man: Man) => number | undefined>,
) {
    const candidates = new Map<Man, MinHeap<Woman>>();
    for (const [man, pref] of men) {

        const heap = MinHeap.inPlaceWrap(
            (a, b) => pref(b)! - pref(a)!,
            Array
                .from(women.keys())
                .filter((x) => pref(x) !== undefined),
        );
        candidates.set(man, heap);
    }
    return candidates;
}

/**
 * Gale-Shapley Stable Marriage algorithm. Preference is a number ranking from highest to
 * lowest (say a=3.432, b=1, a has higher preference) or no preference (undefined).
 * Please make sure the preference function is pure (no side-effects), and ideally its
 * results are memoized by the caller.
 * @param men a map of all men and their preference (in a closure)
 * @param women a map of all women and their preference (in a closure)
 * @returns all matched couples, mapping women to men
 */
export function stableMarriage<Man, Woman>(
    men: IMapReadonly<Man, (woman: Woman) => number | undefined>,
    women: IMapReadonly<Woman, (man: Man) => number | undefined>,
): Map<Woman, Man> {

    const candidates = setupCandidates(men, women);
    const engaged = new Map<Woman, Man>();
    const freeMen = Array.from(men.keys());

    while (freeMen.length > 0) {
        const man = freeMen.pop()!;
        const priority = candidates.get(man)!;
        while (!priority.isEmpty()) {
            const topWoman = priority.pop()!;
            const womanPref = women.get(topWoman)!;
            const aPref = womanPref(man);

            if (aPref === undefined) {
                // woman doesn't even consider man as a candidate
                continue;
            }
            // man is a valid candidate

            const prevMan = engaged.get(topWoman);

            // woman is free
            if (prevMan === undefined) {
                engaged.set(topWoman, man);
                break;
            }

            // woman is engaged
            const bPref = womanPref(prevMan)!; // to be engaged, woman must have a preference on prevMen

            if (aPref > bPref) {
                // current man replaces the previous one
                engaged.set(topWoman, man);
                freeMen.push(prevMan);
                break;
            }

            // woman rejects the man
        }
    }

    return engaged;
}
