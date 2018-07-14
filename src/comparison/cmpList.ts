/** comparator of lists, compared item-by-item. */
export function cmpList<A, B>(
    cmp: (a: A, b: B) => number,
    as: A[],
    bs: B[],
) {
    const [cmpResult] = cmpListHelper(cmp, as, bs);
    return cmpResult;
}

export function listEqual<A, B>(
    cmp: (a: A, b: B) => number,
    as: A[],
    bs: B[],
) {
    return cmpList(cmp, as, bs) === 0;
}

/** Find the first index where as and bs diverge. */
export function listDiff<A, B>(
    cmp: (a: A, b: B) => number,
    as: A[],
    bs: B[],
) {
    const [, diffAt] = cmpListHelper(cmp, as, bs);
    return diffAt;
}

/** returns [comparator result, difference location (or undefined if both lists are equal)] */
function cmpListHelper<A, B>(
    cmp: (a: A, b: B) => number,
    as: A[],
    bs: B[]): [number, number | undefined] {

    let i = 0;
    while (true) {
        if (i === as.length) {
            if (i === bs.length) {
                return [0, undefined]; // as and bs have same length, run out of items to compare
            }
            return [-1, i]; // as is shorter than bs and they share the same prefix
        }
        if (i === bs.length) {
            return [1, i]; // bs is shorter
        }

        const a = as[i];
        const b = bs[i];
        const cmpRet = cmp(a, b);
        if (cmpRet !== 0) {
            return [cmpRet, i];
        }
        ++i;
    }
}
