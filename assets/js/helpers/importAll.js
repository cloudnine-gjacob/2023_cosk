/**
 * Imports all assets from a webpack require.context.
 * @param {Object} r - webpack require.context object
 * @returns {Object} - an object containing all imported assets with their names as keys
 */
export function importAll(r) {
  return r.keys().reduce((acc, key) => {
    // Extract asset name from the key using regex
    const [assetName] = key.match(/(?!.*_)[^\.\/]+/);

    // Throw an error if an asset with the same name already exists
    if (acc.hasOwnProperty(assetName)) {
      throw new Error(`Assets with name "${assetName}" (${key}) exists multiple times, please check your assets!`);
    }

    // Add the asset to the accumulator object with its name as key
    acc[assetName] = {
      id: assetName,
      src: r(key),
      fileName: key.match(/[^\/]+$/)[0],
    };

    return acc;
  }, {});
}
