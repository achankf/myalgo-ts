export type Vec2D = [number, number];

export function equal([ax, ay]: Vec2D, [bx, by]: Vec2D): boolean {
  return ax === bx && ay === by;
}

export function compare([ax, ay]: Vec2D, [bx, by]: Vec2D): number {
  if (ax < bx) {
    return -1;
  }
  if (ax > bx) {
    return 1;
  }
  return ay - by;
}

export function subtract([ax, ay]: Vec2D, [bx, by]: Vec2D): Vec2D {
  return [ax - bx, ay - by];
}

export function add([ax, ay]: Vec2D, [bx, by]: Vec2D): Vec2D {
  return [ax + bx, ay + by];
}

export function norm([ax, ay]: Vec2D): number {
  return Math.sqrt(ax * ax + ay * ay);
}

export function distance(a: Vec2D, b: Vec2D): number {
  return norm(subtract(a, b));
}

export function scalarMult([ax, ay]: Vec2D, scalar: number): Vec2D {
  return [scalar * ax, scalar * ay];
}

export function manhattanDistance(a: Vec2D, b: Vec2D): number {
  const [cx, cy] = subtract(a, b);
  return Math.abs(cx) + Math.abs(cy);
}

/** Calculate the projection of a vector by a scalar. */
export function project(a: Vec2D, scalar = 1): Vec2D {
  const n = norm(a);
  console.assert(
    n !== 0,
    "caller make sure the given vector is not the origin"
  );
  return scalarMult(a, scalar / n);
}

/** Calculate the determinant of a 2D matrix. */
export function determinant([ax, ay]: Vec2D, [bx, by]: Vec2D): number {
  return ax * by - bx * ay;
}

/** Test whether a point P is in the rectangle defined by points A and B. */
export function isPointInRect(
  [px, py]: Vec2D,
  [ax, ay]: Vec2D,
  [bx, by]: Vec2D
): boolean {
  const maxX = Math.max(ax, bx);
  const minX = Math.min(ax, bx);
  const maxY = Math.max(ay, by);
  const minY = Math.min(ay, by);
  return px <= maxX && px >= minX && py <= maxY && py >= minY;
}

// turn this to const enum after this is fixed: https://github.com/Microsoft/TypeScript/issues/16671
export enum IntersectionKind {
  None,
  Tangent,
  Intersection,
}

/**
 * Test whether a given infinite line, defined by a & b, intersects a circle.
 * @param a a point in the line segment
 * @param b another point in the line segment
 * @param c the center of the target circle
 * @param r the target circle's radius
 * @see https://math.stackexchange.com/a/2035466
 * @see http://mathworld.wolfram.com/Circle-LineIntersection.html
 */
export function testLineCircleIntersect(
  a: Vec2D,
  b: Vec2D,
  c: Vec2D,
  r: number
): IntersectionKind {
  // translate a and b by c, to simplify the problem to testing a line to a circle centered around the origin
  const ta = subtract(a, c);
  const tb = subtract(b, c);
  const dr = distance(a, b);
  const dr2 = dr * dr;
  const r2 = r * r;
  const det = determinant(ta, tb);
  const det2 = det * det;
  const discriminant = r2 * dr2 - det2;

  if (discriminant < 0) {
    return IntersectionKind.None;
  } else if (discriminant > 0) {
    return IntersectionKind.Intersection;
  } else {
    return IntersectionKind.Tangent;
  }
}

/**
 * Test whether a given finite line segment, defined by a & b, intersects a circle.
 * @param a a point in the line segment
 * @param b another point in the line segment
 * @param c the center of the target circle
 * @param r the target circle's radius
 */
export function testLineSegmentCircleIntersect(
  a: Vec2D,
  b: Vec2D,
  c: Vec2D,
  r: number
): IntersectionKind {
  // for finite line segments, test whether the center is within the rectangle defined by a,b
  if (!isPointInRect(c, a, b)) {
    return IntersectionKind.None;
  }
  return testLineCircleIntersect(a, b, c, r);
}
