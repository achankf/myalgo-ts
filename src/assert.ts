export function assertDefined<T>(val?: T): T {
  if (val === null || val === undefined) {
    throw new Error("Unreachable - value is not defined");
  }
  return val;
}
