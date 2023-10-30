"use strict";

import { insert } from "..";

export function image(src, dest, options = {}) {
  let _options = {
    dest: dest ? document.querySelector(dest) : document.querySelector("#banner"),

    crop: true,
    density: 2,
    setContainerSize: true,

    type: "img",
    position: "beforeend",
    parent: false,

    id: null,
    cl: null,

    ...options,
  };

  //set ids / cl auto if not defined
  if (!/base64/.test(src) && _options.type != "bg") {
    if (!_options.id) _options.id = src.split(".")[0];
    if (!_options.cl) _options.cl = [src.split(".")[0]];
  }

  //make a dest if not defined
  if (!dest) {
    let newDest = document.createElement("div");
    _options.dest.insertAdjacentElement(_options.position, newDest);
    _options.dest = newDest;

    //add nile name as id and cl
    _options.dest.id = src.split(".")[0];
    _options.dest.classList.add(src.split(".")[0]);
    _options.id = _options.type == "img" ? src.split(".")[0] + "-crop" : null;
  }

  return checkImage(src, _options);
}

//check if image is registered in images object
export function checkImage(src, options) {
  let tempImage = /base64/.test(src) ? src : images[src];
  if (typeof tempImage === "undefined") {
    console.log("\n");
    console.warn("image not registered: " + src);
    console.warn("moving on to next image!");
    console.log("\n");
    return new Promise((resolve, reject) => {
      resolve();
    });
  } else {
    return loadImage(tempImage, options);
  }
}

export function loadImage(src, options = {}) {
  let canvas, context, masterImage, masterImageData, masterWidth, masterHeight;

  return new Promise((resolve, reject) => {
    const imagePromises = [];

    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");

    options.density = options.density === "auto" ? getPixelDensity(canvas) : options.density;

    masterImage = new Image();
    masterImage.src = src;
    masterImage.onload = () => splitMasterImage();
    masterImage.addEventListener("error", (err) => reject(err));

    function splitMasterImage() {
      console.time("start");
      masterWidth = masterImage.width;
      masterHeight = masterImage.height;

      //set canvas size
      canvas.width = masterImage.width;
      canvas.height = masterImage.height;

      //draw master image into canvas
      context.drawImage(masterImage, 0, 0);
      masterImageData = context.getImageData(0, 0, masterWidth, masterHeight);

      //find solid pixels y
      let row = [];
      for (let r = 0; r < masterImage.height; r++) {
        if (transparentRow(masterImageData, 0, r, masterWidth) === false) row.push(r);
      }

      //find solid pixels x
      let col = [];
      for (let c = 0; c < masterImage.width; c++) {
        if (transparentColumn(masterImageData, c, 0, masterHeight) === false) col.push(c);
      }

      //first solid pixel x, first solid pixel y, last solid pixel x, last solid pixel y
      let x = col[0];
      let y = row[0];
      let width = col[col.length - 1] - col[0] + 1;
      let height = row[row.length - 1] - row[0] + 1;

      //console.log('width: ' + width + ' width 4: ' + width % 4);
      //console.log('height: ' + height + ' height 4: ' + height % 4);

      //console.log('* width: ' + width + ' width 4: ' + width % 4);
      //console.log('* height: ' + height + ' height 4: ' + height % 4);
      //height = height + (height % 4)

      //console.log('width: ' + width + ' width 4: ' + width % 4);
      //console.log('height: ' + height + ' height 4: ' + height % 4);

      /*width = ((width) % 2 === 0) ? width: width + 1;
      height = ((height) % 2 === 0) ? height: height + 1;

      width = ((width / options.density) % 2 === 0) ? width : width + 1;
      height = ((height / options.density) % 2 === 0) ? height : height + 1;

      width = ((width / options.density) % 1 === 0) ? width : width - 1;
      height = ((height / options.density) % 1 === 0) ? height : height - 1;*/

      width = width % 4 === 0 ? width : Math.round(width / 4) * 4;
      height = height % 4 === 0 ? height : Math.round(height / 4) * 4;

      if (options.setContainerSize) {
        options.dest.style.position = "absolute";
        options.dest.style.top = Math.floor(y / options.density) + "px";
        options.dest.style.left = Math.floor(x / options.density) + "px";
        options.dest.style.width = Math.floor(width / options.density) + "px";
        options.dest.style.height = Math.floor(height / options.density) + "px";
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(masterImage, x, y, width, height, 0, 0, width, height);

      let clip = canvas.toDataURL();
      let imageWidth = Math.floor(width / options.density);
      let imageHeight = Math.floor(height / options.density);

      console.timeEnd("start");

      imagePromises.push(
        insert({ src: clip, id: "crop" }, options.dest, {
          dest: options.dest,
          id: options.id,
          cl: options.cl,
          type: options.type,
          parent: options.parent,
          position: options.position,
          width: options.crop ? imageWidth : -1,
          height: options.crop ? imageHeight : -1,
        })
      );

      Promise.all(imagePromises)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  //check if row is transparent
  function transparentRow(imageData, _x, _y, _width) {
    for (let x = _x; x < _x + _width; x++) {
      if (transparentPixel(imageData, x, _y) === false) return false;
    }
    return true;
  }

  //check if column is transparent
  function transparentColumn(imageData, _x, _y, _height) {
    for (let y = _y; y < _y + _height; y++) {
      if (transparentPixel(imageData, _x, y) === false) return false;
    }
    return true;
  }

  function transparentPixel(imageData, _x, _y) {
    return imageData.data[_y * masterWidth * 4 + _x * 4 + 3] === 0;
  }
}
