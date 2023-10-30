/**
   Calculates pixel density factor for a given canvas.
   @param {HTMLCanvasElement} canvas - The canvas element.
   @return {number} - The factor to scale the canvas with.
*/

export default function getPixelDensity(canvas) {
  // Check if the canvas has a 2D context.
  if (canvas.getContext) {
    // Get the 2D context of the canvas.
    let context = canvas.getContext("2d");

    // Set the default factor to 1.
    let factor = 1;

    // Check if the display is a retina display.
    let isRetina = window.devicePixelRatio > 1;

    // Check if the device is an iOS device without auto double.
    let isIOS = context.webkitBackingStorePixelRatio < 2 || context.webkitBackingStorePixelRatio === undefined;

    // If the display is retina and the device is iOS without auto double, set the factor to 2.
    if (isRetina && isIOS) {
      factor = 2;
    }

    // Return the factor.
    return factor;
  }
}
/**
 * This function takes a canvas element as input and calculates
 * the pixel density factor to scale the canvas with, based on the type of display and device.
 * The pixel density factor is returned. If the canvas does not have a 2D context, nothing is returned.
 * The function checks if the display is a retina display and if the device is an iOS device without auto double.
 * If both conditions are true, the factor is set to 2.
 */
