function reorder(bound1: number, bound2: number): [number, number] {
    let low;
    let high;
    if (bound1 > bound2) {
        low = bound2;
        high = bound1;
    } else {
        low = bound1;
        high = bound2;
    }
    return [low, high];
}

/** Ensure the val is fixed between the boundaries. */
export function clamp(val: number, bound1: number, bound2: number) {
    const [low, high] = reorder(bound1, bound2);
    return Math.min(high, Math.max(low, val));
}

/** Return 0 if val is undefined. */
export function defaultZero(val?: number | undefined) {
    return val === undefined ? 0 : val;
}

/**
 *  Returns an indicator between 0 and 1 from the low side.
 *  Use 1-position to get an indicator from the high side.
 */
export function position(cursor: number, bound1: number, bound2: number) {
    const [low, high] = reorder(bound1, bound2);
    const numerator = cursor - low;
    const denominator = high - low;

    if (numerator < 0) {
        return 0; // none
    }
    if (denominator === 0) {
        return 1; // infinity
    }
    return Math.min(1, numerator / denominator);
}
