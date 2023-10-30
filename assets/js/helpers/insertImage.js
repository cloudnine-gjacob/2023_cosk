const insertImage = async (asset, dest = document.querySelector("#banner"), options = {}) => {
  /**
   * check if dest exists
   */
  if (typeof dest === "string") {
    let destEL = document.querySelector(dest);

    if (!destEL) {
      throw new Error(`destination ${dest} does not exist!`, "insertImage.js");
    }

    dest = destEL;
  }

  let _options = {
    dest,

    width: -1,
    height: -1,

    type: "img",
    position: "beforeend",
    parent: false,

    id: null,
    cl: null,

    ...options,
  };

  /**
   * check if asset has src & id or a string
   */
  if (typeof asset === "string") {
    asset = {
      src: asset,
      id: "",
    };
  }

  _options.id = _options.id ? _options.id : asset.id;

  _options.id = options.id === false ? undefined : _options.id;

  /**
   * BACKGROUND-IMAGES
   */
  if (_options.type === "bg") {
    //create new div for background image#
    if (!options.parent || !dest) {
      let newDest = document.createElement("div");
      _options.dest.insertAdjacentElement(_options.position, newDest);
      _options.dest = newDest;
    }

    if (options.parent && _options.id) {
      console.warn("do not set IDs for parent BG images: " + src);
      _options.id = null;
    }
  }

  await loadImage(asset, _options);
};

function loadImage({ src }, options = {}) {
  return new Promise((resolve, reject) => {
    if (/<div/.test(src)) {
      const parser = new DOMParser();

      const doc = parser.parseFromString(src, "text/html");

      const assetNode = doc.documentElement.querySelectorAll(".c9-split, .c9-crop")[0];

      console.log(assetNode);

      if (options.id) assetNode.id = options.id;

      options.dest.appendChild(assetNode);

      resolve();
    } else {
      let img = new Image();
      img.src = src;
      let el = options.type === "bg" ? options.dest : img;

      //apply loaded image to destination
      if (options.type === "bg") {
        options.dest.style.backgroundImage = "url(" + img.src + ")";

        //insert new image into DOM
      } else if (options.type === "img" && !options.parent) {
        options.dest.insertAdjacentElement(options.position, el);
      } else if (options.type === "img" && options.parent) {
        options.dest.parentNode.replaceChild(el, options.dest);
      }

      //add id to destination
      if (options.id) el.id = options.id;

      //add class list to destination
      if (options.cl) {
        for (let i = 0; i < options.cl.length; i++) {
          el.classList.add(options.cl[i]);
        }
      }

      //set width and height
      if (options.width !== -1) {
        el.style.width = options.width + "px";
        el.style.height = options.height + "px";
      }

      img.onload = () => resolve();

      //somthing went really wrong
      img.addEventListener("error", (err) => {
        reject(err);
      });
    }
  });
}

export { insertImage };
