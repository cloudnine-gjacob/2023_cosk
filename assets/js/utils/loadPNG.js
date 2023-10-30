"use strict";

// import loadingError from '_shared/js/utils/loadingError';

export default function loadPNG(imagePath, callback, dest = document.body) {
  console.log("loadPNG");

  const img = new Image();
  // img.addEventListener('error', loadingError);

  if (window.c9Config.adHoster != "flashtalking" || window.isLocal()) img.crossOrigin = "Anonymous";
  img.src = imagePath;
  const splitter = "$e$";

  img.addEventListener(
    "load",
    function () {
      // Setup Canvas a draw image
      let context, canvas;

      canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.mozImageSmoothingEnabled = false;
      context.webkitImageSmoothingEnabled = false;
      context.msImageSmoothingEnabled = false;
      context.drawImage(img, 0, 0);

      // Read image's data
      let data;

      data = context.getImageData(0, 0, img.width, img.height).data;
      let payload = "";

      for (let d = 0; d < data.length; d++) {
        if ((d + 1) % 4) payload += String.fromCharCode(`0x${data[d].toString(16)}`);
      }

      // data.forEach((dataItem, index) => {
      //    if ((index + 1) % 4) {
      //       payload += String.fromCharCode(`0x${dataItem.toString(16)}`);
      //    }
      // });

      payload = payload.split(splitter)[0];
      // payload += "window.start();";

      // causes some problems with IE
      // var s = document.createElement('script');
      // s.innerText = payload;
      // document.body.appendChild(s);

      //works with adwords but very much like eval
      // var s = new Function(payload);
      // s();

      //seems to be the most compatible choice
      let oScript = document.createElement("script");
      let oScriptText = document.createTextNode(payload);
      oScript.appendChild(oScriptText);
      dest.appendChild(oScript);

      //adwords does not like this one
      // let s = document.createElement('script');
      // s.src = 'data:text/javascript,' + encodeURIComponent(payload)
      // document.body.appendChild(s);

      callback.call();
    },
    false
  );
}
