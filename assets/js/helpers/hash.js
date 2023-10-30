/**
 * Calculates a 53-bit hash value (as a 64-bit integer) for the given string using the Cyrb53 algorithm.
 * @param {string} str - The input string to calculate the hash for.
 * @param {number} [seed=0] - Optional seed value for the hash calculation.
 * @returns {number} The 53-bit hash value.
 */
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function generateAlphabet(capital = false) {
  return [...Array(26)].map((_, i) => String.fromCharCode(i + (capital ? 65 : 97)));
}

function getRandomLetter() {
  const alphabet = generateAlphabet();
  return alphabet[Math.round(Math.random() * alphabet.length)];
}

export { cyrb53, generateAlphabet, getRandomLetter };
