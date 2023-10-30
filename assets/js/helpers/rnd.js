/**
 * @description generates pseudo-random Number
 * @param {int} [seed] - seed of pseudo-random Number
 * @returns {number}
 */

export function rnd( seed = undefined ) {
  if (!Number.isInteger( seed )){
    const d = new Date();
    const m = d.getMilliseconds();
    seed = m;
  }
  const x = Math.sin( seed ) * 10000;
  return x - Math.floor(x);
}


/**
 * @description generates pseudo-random Number between two Numbers
 * @param {number} [min] - minimum
 * @param {number} [max] - maximum
 * @param {int} [seed] - seed of pseudo-random Number
 * @returns {number}
 */
export function rndRange(min, max, seed = undefined ){
  return Math.floor(rnd( seed ) * max) + min;
}


/**
 * @description generates pseudo-random Hex String
 * @param {int} [seed] - seed of pseudo-random Number
 * @returns {string}
 */
export function rndHex( seed = undefined){
  return Math.floor( rnd( seed ) * 16777215 ).toString(16);
}

