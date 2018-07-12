import { IMapReadonly } from "./map/mapIter";

/**
 * Memoization
 * @param genVal generator whose values will be memoized
 */
export function memo<T, U>(genVal: (key: T) => U) {
    const memory = new Map<T, U>();
    return (target: T): U => {
        if (!memory.has(target)) {
            const val = genVal(target);
            memory.set(target, val);
            // fall-through
        }
        return memory.get(target) as U;
    };
}

/**
 * Similar to memo(), expect the target would generate a range of values through genRange,
 * based on keys derived from keyBy.
 * @param genRange generate a range of values to be memoized, the values for
 *  one key must be disjoint from those of other keys
 * @param keyBy derive keys for genRange()
 */
export function memoBy<S, T, U>(genRange: (key: T) => IMapReadonly<S, U>, keyBy: (s: S) => T) {
    const memory = new Map<S, U>();
    return (target: S): U => {
        if (!memory.has(target)) {
            const key = keyBy(target);
            for (const [s, u] of genRange(key)) {
                if (memory.has(s)) {
                    throw new Error("genRange keys overlap (all keys from keyBy must be mapped to disjoint sets");
                }
                memory.set(s, u);
            }
            if (!memory.has(target)) {
                throw new Error("genRange doesn't cover the target");
            }
            // fall-through
        }
        return memory.get(target) as U;
    };
}
