
/** Test whether 2 arrays are equal */
export function arrayEqual<T>(cmp: (a: T, b: T) => number, as: T[], bs: T[]) {
    if (as.length !== bs.length) {
        return false;
    }
    return as.every((a, i) => cmp(a, bs[i]) === 0);
}

/** Find the first index where as and bs diverge. */
export function arrayDiff<T>(cmp: (a: T, b: T) => number, as: T[], bs: T[]) {
    let long;
    let short;
    if (as.length > bs.length) {
        long = as;
        short = bs;
    } else {
        long = bs;
        short = as;
    }
    let i = 0;
    for (const lo of long) {
        const sh = short[i];
        if (cmp(lo, sh) !== 0) {
            return i;
        }
        ++i;
    }
    return undefined;
}
