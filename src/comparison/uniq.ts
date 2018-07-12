import { toIt } from "../iter";

/**
 *  Return a list of unique values from a sorted list of values
 * @param sortedVals a sorted list
 * @param cmp the comparator
 */
export function uniq<T>(sortedVals: T[], cmp: (a: T, b: T) => number) {

    function* uniqHelper() {
        if (sortedVals.length === 0) {
            return;
        }

        let cur = sortedVals[0];
        for (const val of sortedVals) {
            if (cmp(val, cur) !== 0) {
                yield cur;
                cur = val;
            }
        }
        yield cur; // either the last value is unique, or the previous value is not unique but haven't reported
    }

    return toIt(uniqHelper());
}
