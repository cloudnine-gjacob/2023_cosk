/**
 *
 * @param {object} imageObj
 * @returns {Promise}
 * @desc This function creates a png data url from an image.
 *       ATTENTION: this funcion has sideeffects and will
 *       change the passed in Object
 */

export default async function loadImages(images) {
  const promises = [];

  images.forEach((fileName) => {
    promises.push(
      new Promise((resolve, reject) => {
        let image = new Image();
        image.src = fileName;

        image.onload = function () {
          let width = this.width;
          let height = this.height;

          let outputCanvas = document.createElement('canvas');
          outputCanvas.width = width;
          outputCanvas.height = height;
          let outputCtx = outputCanvas.getContext('2d');
          outputCtx.putImageData(image, 0, 0, 0, 0, width, height);

          let assetName = key.match(/(?!.*_)[^\.\/]+/);
          window.assets['key'] = {
            id: assetName,
            fileName: fileName,
            src: outputCanvas.toDataURL()
          };

          resolve();
        };

        image.addEventListener('error', reject);
      })
    );
  });

  await Promise.all(promises);
}
