import loadScript from "./utils/loadScript";
import loadPNG from "./utils/loadPNG";
// import loadingError from '_shared/js/utils/loadingError';

/**
 * Primary js
 * @description loads the main js
 * @param {Function} callback | optional callback for the loader
 * @return void
 */

window.loadMainJs = (callback = null) => {
  let path = window.isLocal() || c9Config.adHoster !== "dcs" ? "" : c9Config.cdnUrl;
  let asset = path + mainBundle;

  if (/\.png$/.test(asset)) {
    loadPNG(asset, (err) => {
      if (err) {
        console.log(err);
        // loadingError();
        return false;
      } else {
        setTimeout(() => {
          if (typeof callback === "function") {
            callback.call();
          }
        }, 10);
      }
    });
  } else {
    loadScript(asset)
      .then(() => {
        setTimeout(() => {
          if (typeof callback === "function") {
            callback.call();
          }
        }, 10);
      })
      .catch((err) => {
        console.error(err);
      });
  }
};
