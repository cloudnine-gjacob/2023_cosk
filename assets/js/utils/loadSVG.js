"use strict";

//inserts new svg tag
export default function loadSVG(src, dest, options = {}) {
  let _options = {
    dest: dest ? document.querySelector(dest) : document.querySelector("#banner"),
    ...options,
  };

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("get", src, true);
    xhr.onreadystatechange = onChange;
    xhr.send();

    function onChange() {
      if (xhr.readyState == 4) {
        console.log("done");
        let svg = xhr.responseXML.documentElement;
        _options.dest.appendChild(svg);
        resolve();
      }
    }
  });
}
