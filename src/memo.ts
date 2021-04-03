/**
 * Memoization
 * @param genVal generator whose values will be memoized
 */
export function memo<T, U>(genVal: (key: T) => U): (target: T) => U {
  const memory = new Map<T, U>();
  return (target) => {
    if (!memory.has(target)) {
      const val = genVal(target);
      memory.set(target, val);
      // fall-through
    }
    return memory.get(target) as U;
  };
}
