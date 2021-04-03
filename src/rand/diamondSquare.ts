/**
 * The diamond-square algorithm; returns a float array with values between 0 and 1 that represents a square grid.
 * @see http://www.gameprogrammer.com/fractal.html#midpoint
 * @see http://jmecom.github.io/blog/2015/diamond-square/
 * @see http://stevelosh.com/blog/2016/08/lisp-jam-postmortem/#tiling-diamond-square
 * @see http://www.playfuljs.com/realistic-terrain-in-130-lines/
 */
export function diamondSquare(
  prng: () => number,
  nside: number,
  roughness: number
): Float32Array {
  console.assert(
    Number.isInteger(Math.log2(nside - 1)),
    "nside must be of the form (2^n)+1"
  );

  const data = new Float32Array(nside * nside);

  const stepMax = nside - 1;
  const isValidCoor = ([x, y]: [number, number]) =>
    x >= 0 && x < nside && y >= 0 && y < nside;
  const idx = ([x, y]: [number, number]) => y * nside + x;
  const get = (target: [number, number]) => data[idx(target)];
  const set = (target: [number, number], val: number) => {
    const i = idx(target);
    console.assert(val > 0);
    console.assert(data[i] === 0);
    data[i] = val;
  };
  const assign = (
    target: [number, number],
    coors: Array<[number, number]>,
    scale: number
  ) => {
    const validCoors = coors.filter(isValidCoor).map(get);

    const sum = validCoors.reduce((prev: number, cur: number) => prev + cur, 0);
    const avgValue = sum / validCoors.length;

    const randomness = prng() * scale;
    const height = avgValue + randomness;
    console.assert(Number.isFinite(height));
    set(target, height);
  };
  const diamond = (step: number, scale: number) => {
    const halfstep = step / 2;
    for (let y = halfstep; y <= stepMax; y += step) {
      for (let x = halfstep; x <= stepMax; x += step) {
        const coors: Array<[number, number]> = [
          [x - halfstep, y - halfstep], // top-left
          [x + halfstep, y - halfstep], // top-right
          [x - halfstep, y + halfstep], // bottom-left
          [x + halfstep, y + halfstep], // bottom-right
        ];
        assign([x, y], coors, scale);
      }
    }
  };
  const square = (step: number, scale: number) => {
    const halfstep = step / 2;
    let startMiddle = true;
    for (let y = 0; y <= stepMax; y += halfstep) {
      const start = startMiddle ? halfstep : 0;
      startMiddle = !startMiddle;
      for (let x = start; x <= stepMax; x += step) {
        const coors: Array<[number, number]> = [
          [x, y - halfstep], // top
          [x, y + halfstep], // bottom
          [x - halfstep, y], // left
          [x + halfstep, y], // right
        ];

        assign([x, y], coors, scale);
      }
    }
  };

  {
    // set up initial values for the 4 corners
    set([0, 0], prng());
    set([0, nside - 1], prng());
    set([nside - 1, 0], prng());
    set([nside - 1, nside - 1], prng());

    let scale = 0.1;
    for (
      let step = stepMax;
      step > 1;
      step /= 2, scale = (step / nside) * roughness
    ) {
      diamond(step, scale);
      square(step, scale);
    }
  }

  const maxHeight = Math.max(...data);
  const minHeight = Math.min(...data);
  const heightDiff = maxHeight - minHeight;
  console.assert(heightDiff > 0); // TODO is this a flat map when assertion fails?

  // normalize values
  const normalized = data.map((x) => (x - minHeight) / heightDiff);
  console.assert(normalized.every((x) => x >= 0 && x <= 1));

  return normalized;
}
