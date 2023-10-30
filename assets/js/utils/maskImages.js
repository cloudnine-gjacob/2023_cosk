/**
 *
 * @param {object} imageObj
 * @returns {Promise}
 * @desc This function creates a png data url from an image.
 *       ATTENTION: this funcion has sideeffects and will
 *       change the passed in Object
 */

export default async function maskImage(imageObj) {
  const promises = [];

  for (const [key, { src, fileName }] of Object.entries(imageObj)) {
    if (/.mask.jpg$/.test(fileName)) {
      promises.push(
        new Promise((resolve, reject) => {
          let image = new Image();
          image.src = src;

          image.onload = function () {
            let width = this.width;
            let height = this.height / 2;

            let outputCanvas = document.createElement('canvas');
            outputCanvas.width = width;
            outputCanvas.height = height;
            let outputCtx = outputCanvas.getContext('2d');

            let maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height * 2;
            let maskCtx = maskCanvas.getContext('2d');

            maskCtx.drawImage(this, 0, 0);

            let image = maskCtx.getImageData(0, 0, width, height);
            let imageData = image.data;
            let alphaData = maskCtx.getImageData(0, height, width, height).data;

            let length = imageData.length;

            for (let i = 3; i < length; i = i + 4) {
              imageData[i] = alphaData[i - 1];
            }

            outputCtx.putImageData(image, 0, 0, 0, 0, width, height);

            imageObj[key].src = outputCanvas.toDataURL();

            outputCanvas = null;
            maskCanvas = null;

            resolve();
          };

          image.addEventListener('error', reject);
        })
      );
    }
  }

  await Promise.all(promises);
}
