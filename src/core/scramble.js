/**
 * Atgriež nejaušu masīva elementu.
 *
 * @template T
 * @param {T[]} array
 * @returns {T}
 */
function randomElement(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Atgriež nejaušu masīva elementu, ņemot vērā tā svaru.
 *
 * @template T
 * @param {T[]} items
 * @param {number[]} weights
 * @returns {T}
 */
function weightedRandomElement(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;

  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];

    if (random < cumulativeWeight) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/** @typedef {'U' | 'D' | 'R' | 'L' | 'F' | 'B'} CubeFace */
/**
 * Ģenerē nejaušu sajaukumu.
 *
 * @param {number} length
 * @returns {string}
 */
export function generateScramble(length = 26) {
  /** @type {CubeFace[]} */
  const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
  /** @type {Record<CubeFace, string>} */
  const axes = {
    U: 'y',
    D: 'y',
    R: 'x',
    L: 'x',
    F: 'z',
    B: 'z'
  };
  const mods = ['', '\'', '2'];
  let scramble = '';
  /** @type {CubeFace | ''} */
  let lastMove = '';

  for (let i = 0; i < length; i++) {
    let faceMove;
    do {
      faceMove = randomElement(faces);
    } while (lastMove && axes[faceMove] === axes[lastMove]); // Neļauj ģenerēt secīgus griezienus uz vienas ass

    lastMove = faceMove;
    let mod = randomElement(mods);
    scramble += faceMove;
    scramble += mod;
    scramble += ' ';
  }
  return scramble.trimEnd();
}


// TODO: add scramble generation for other puzzles. Groups: (2x2, 3x3), (4x4, 5x5), (6x6, 7x7), (Pyraminx, Skewb), (Megaminx)

console.log(generateScramble());

