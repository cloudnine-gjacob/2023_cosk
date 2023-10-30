"use strict";

// import '../../scss/tools/splitPNG.scss'

// const Promise = require('es6-promise').Promise;
// if (!window.Promise) {
//    window.Promise = Promise;
// }

import getPixelDensity from "../../utils/getPixelDensity";
import { insert } from "..";

/**
 * Splits Pngs according to the given parameters
 * @param {HTMLElement} container - ContainerElement
 * @param {Image} image - Image to split
 * @param {Object} options - Options
 * @returns {Promise<any>}
 * @constructor
 */

export function image(image, dest, options = {}) {
  let _options = {
    dest: dest ? document.querySelector(dest) : document.querySelector("#banner"),
    type: "img",
    gapWidth: 0,
    density: 2,
    crop: true,
    setContainerSize: false, //setzt width, height im äußeren Container
    ...options,
  };

  // let time = new Date().getMilliseconds();

  return new Promise((resolve, reject) => {
    //global vars
    let canvas, context, masterImageData, masterWidth, masterHeight;

    //array with all rows found
    let rows = [];
    //largest height of all split rows
    let maxHeight = 0;

    //wait for all images to finish creation with promises
    const createImagePromises = [];

    //load png image to be split
    const masterImage = new Image();
    masterImage.src = image;
    masterImage.onload = () => splitMasterImage();
    masterImage.addEventListener("error", (err) => reject(err));

    //splits image into rows
    function splitMasterImage() {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");

      //setup options based on loaded image
      //set gap to full image width when no columns are needed
      _options.gapWidth = _options.gapWidth === 0 ? masterImage.width : _options.gapWidth;
      //set density of final image based on canvas when auto
      _options.density = _options.density === "auto" ? getPixelDensity(canvas) : _options.density;

      masterWidth = masterImage.width;
      masterHeight = masterImage.height;

      //set canvas size
      canvas.width = masterWidth;
      canvas.height = masterHeight;

      //draw master image into canvas
      context.drawImage(masterImage, 0, 0);
      //get master image data
      masterImageData = context.getImageData(0, 0, canvas.width, canvas.height);

      //split image into chunks of pixels by rows
      splitImageRows();

      //add all elements to DOM
      addDOMElements();

      Promise.all(createImagePromises)
        .then(() => {
          // console.log(new Date().getMilliseconds() - time)
          resolve();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    function splitImageRows() {
      //single row
      let row = {};

      //scan image from left to right top to bottom for transparent rows
      for (let r = 0; r < masterImage.height; r++) {
        //search for rows with pixels if at last row of pixels always check if row is saved
        if (transparentRow(masterImageData, 0, r, masterWidth) === false && r < masterImage.height - 1) {
          //sets first y value for row
          if (row.y === undefined) row.y = r;

          //save row info at start of next transparent block
        } else if (row.y !== undefined) {
          //set height of row
          row.height = Math.ceil((r - row.y) / 2) * 2;
          //set max height if this row was taller
          if (row.height > maxHeight) maxHeight = row.height;

          //split row into columns
          splitImageColumns(row);

          //save row in array
          rows.push(row);
          //setup new row
          row = {};
        }
      }
    }

    function splitImageColumns(row) {
      let columns = [];
      let column = {};

      //start of transparent area or first column
      let gapStart = 0;
      //scan image from top to row start to row finish for transparent columns
      for (let c = 0; c < masterWidth; c++) {
        //find first column with pixels
        if (transparentColumn(masterImageData, c, row.y, row.height) === false && c < masterWidth - 1) {
          //sets first x value for column
          if (column.x === undefined) column.x = c;
          //sets first x value for start of row
          if (row.x === undefined) row.x = c;

          //save col info at start of next transparent block
        } else if (column.x !== undefined) {
          //if previous pixel was not transparent set start of new gap
          if (transparentColumn(masterImageData, c - 1, row.y, row.height) === false) {
            gapStart = c;
          }

          //next pixel is > gapWidth or end of image
          if (gapStart + _options.gapWidth <= c || c === masterWidth - 1) {
            //set column width add 1 pixel to prevent right side being cut off
            column.width = Math.ceil((gapStart - column.x + 1) / 2) * 2;
            //save column to array
            columns.push(column);

            //save row width
            row.width = Math.ceil((gapStart - row.x + 1) / 2) * 2;

            //setup new column
            column = {};
          }
        }
      }

      row.columns = columns;
    }

    function addDOMElements() {
      //sets container size to fixed width and height
      if (_options.setContainerSize) {
        _options.dest.style.width = Math.round(masterWidth / _options.density) + "px";
        _options.dest.style.height = Math.round(masterHeight / _options.density) + "px";
      }

      //add DOM Rows
      for (let l = 0; l < rows.length; l++) {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("line");
        rowDiv.classList.add("line" + l);
        rowDiv.setAttribute("data-maxheight", maxHeight + 1);

        rowDiv.style.position = "absolute";

        //set size of dom element to row size
        if (_options.crop) {
          rowDiv.style.top = Math.round(rows[l].y / _options.density) + "px";
          rowDiv.style.left = Math.round(rows[l].x / _options.density) + "px";
          rowDiv.style.width = Math.round(rows[l].width / _options.density) + "px";
          rowDiv.style.height = Math.round(rows[l].height / _options.density) + "px";

          //just save the row size info in data elements
        } else {
          rowDiv.setAttribute("data-top", Math.round(rows[l].y / _options.density));
          rowDiv.setAttribute("data-left", Math.round(rows[l].x / _options.density));
          rowDiv.setAttribute("data-width", Math.round(rows[l].width / _options.density));
          rowDiv.setAttribute("data-height", Math.round(rows[l].height / _options.density));
        }

        //add row to dom
        _options.dest.appendChild(rowDiv);

        //add columns to dom
        let columns = rows[l].columns;
        for (let c = 0; c < columns.length; c++) {
          let colDiv = document.createElement("div");
          colDiv.classList.add("column-holder");

          //set size of dom element to column size
          if (_options.crop) {
            colDiv.style.left = Math.round((columns[c].x - rows[l].x) / _options.density) + "px";
            colDiv.style.width = Math.round(columns[c].width / _options.density) + "px";
            colDiv.style.height = Math.round(rows[l].height / _options.density) + "px";

            //just save the row size info in data elements
          } else {
            colDiv.setAttribute("data-left", Math.round((columns[c].x - rows[l].x) / _options.density));
            colDiv.setAttribute("data-width", Math.round(columns[c].width / _options.density));
            colDiv.setAttribute("data-height", Math.round(rows[l].height / _options.density));
            colDiv.classList.add("non-crop");
          }

          //add column to row
          rowDiv.appendChild(colDiv);

          //draw column image
          drawImage(colDiv, columns[c].x, rows[l].y, columns[c].width, rows[l].height, c);
        }
      }
    }

    function drawImage(div, x, y, width, height, columnId) {
      let clip;

      if (_options.crop) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(masterImage, x, y, width, height, 0, 0, width, height);
      } else {
        canvas.width = masterWidth;
        canvas.height = masterHeight;
        context.rect(x, y, width, height);
        context.clip();
        context.drawImage(masterImage, 0, 0);
      }

      clip = canvas.toDataURL();
      createImagePromises.push(insert(clip, div, { dest: div, cl: ["column" + columnId, "column"], type: _options.type }));
    }

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
  });
}
