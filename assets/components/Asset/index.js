"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import { getComputedStyle, getCssVar } from "@helpers";

export class Asset extends AbstractComponent {
  static tag = "ad-asset";

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.classList.add("asset");
    this.render();
  }

  render() {
    this.defaultDensity = this.props.density || window.c9Config.defaultDensity || 2;

    //check for the src in the window object
    const src = this.props.src || this.props.s;
    let asset = window.assets?.[src];

    if (asset) {
      this.componentClass = window.assets[src].id;
      this.classList.add(this.componentClass);
      this.fileName = window.assets[src].fileName;
      asset = asset.src;

      //else set asset and file name to src
    } else {
      this.componentClass = src.match(/(?!.*_)[^\.\/]+/);
      this.classList.add(this.componentClass);
      this.fileName = asset = src;
    }

    //check if the svg should be loaded inline
    if (/\.inline\.svg$/.test(this.fileName)) {
      this.loadSvgInline(asset);

      //check if the src is a div or svg
    } else if (/^(<div|<svg|<\?xml)/.test(asset)) {
      this.insertDom(asset);

      //check if the image should be masked
    } else if (!/\.mask\.jpg$/.test(this.fileName)) {
      this.loadImage(asset);
    } else if (/\.mask\.jpg$/.test(this.fileName)) {
      this.maskImage(asset);
    } else {
      console.warn(`asset '${src}' not valid`);
      return;
    }

    if (this.props.clipPath) this.createClipPath();
  }

  loadImage(asset) {
    this.loaded = new Promise((resolve, reject) => {
      let img = new Image();
      img.src = asset;
      img.classList.add("asset-image");

      img.addEventListener("load", (e) => {
        this.onLoad(e);
        !this.props.bg ? this.appendChild(img) : (this.style.backgroundImage = "url(" + img.src + ")");
        resolve();
      });

      img.addEventListener("error", () => {
        console.warn(asset + " did not load");
        reject();
      });
    });
  }

  insertDom(asset) {
    this.loaded = new Promise((resolve, reject) => {
      this.innerHTML = asset;
      const assetEl = this.querySelector(".c9-crop, .c9-split");

      if (assetEl) {
        this.displayWidth = assetEl.getAttribute("display-width");
        this.displayHeight = assetEl.getAttribute("display-height");
      }
      this.setCssVariables();

      if (/<svg/.test(asset)) {
        this.fixSVG();
      }
      resolve();
    });
  }

  loadSvgInline(asset) {
    this.loaded = new Promise((resolve, reject) => {
      fetch(asset)
        .then((response) => {
          if (!response.ok) {
            reject(`${asset} could not be loaded!`);
          }
          return response.text();
        })
        .then((svgString) => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgString, "application/xml");
          this.appendChild(svgDoc.documentElement);
          this.fixSVG();
          resolve();
        });
    });
  }

  //fixes illustrator SVGs that have dublicate id names
  // svgData2ID() {
  //   let elements = this.querySelector("svg");
  //   let validNodes = elements.getElementsByTagName("*");
  //   for (let n = 0; n < validNodes.length; n++) {
  //     let tempNode = validNodes[n];
  //     let tempId = tempNode.id;
  //     let tempName = tempNode.getAttribute("data-name");

  //     if (tempId && tempName) {
  //       tempNode.id = tempName;
  //     }
  //   }
  // }

  fixSVG() {
    const elements = this.querySelector("svg");
    const childNodes = [].slice.call(elements.querySelectorAll("*"));
    const clipId = this.makeId(5);

    childNodes.forEach((childNode) => {
      // console.log(childNode);
      const tempId = childNode.id;
      const tempName = childNode.getAttribute("data-name");
      if (tempId && tempName) {
        childNode.id = tempName;
      }

      const childNodeAttributes = childNode.attributes;
      for (let idx = 0; idx < childNodeAttributes.length; idx++) {
        const value = childNodeAttributes[idx].value;
        const rgx = new RegExp("clippath");
        const newValue = value.replace(rgx, `clippath-${clipId}${idx}`);

        childNode.setAttribute(childNodeAttributes[idx].name, newValue);
      }
    });
  }

  makeId(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  maskImage(asset) {
    try {
      let mask = new Image();
      mask.src = asset;

      mask.addEventListener("load", (e) => {
        let width = e.currentTarget.width;
        let height = e.currentTarget.height / 2;

        let outputCanvas = document.createElement("canvas");
        outputCanvas.width = width;
        outputCanvas.height = height;
        let outputCtx = outputCanvas.getContext("2d");

        let maskCanvas = document.createElement("canvas");
        maskCanvas.width = width;
        maskCanvas.height = height * 2;
        let maskCtx = maskCanvas.getContext("2d");

        maskCtx.drawImage(e.currentTarget, 0, 0);

        let image = maskCtx.getImageData(0, 0, width, height);
        let imageData = image.data;
        let alphaData = maskCtx.getImageData(0, height, width, height).data;

        let length = imageData.length;

        for (let i = 3; i < length; i = i + 4) {
          imageData[i] = alphaData[i - 1];
        }

        outputCtx.putImageData(image, 0, 0, 0, 0, width, height);
        this.loadImage(outputCanvas.toDataURL());

        outputCanvas = null;
        maskCanvas = null;
      });
    } catch (e) {
      console.warn(asset + " did not mask");
    }
  }

  createClipPath() {
    try {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.style.position = "absolute";
      svg.style.width = 0;
      svg.style.height = 0;
      const clipPath = document.createElementNS(svgNS, "clipPath");
      clipPath.setAttributeNS(null, "id", this.componentClass + "-clip");
      svg.appendChild(clipPath);

      const nodes = document.querySelector(this.props.clipPath).childNodes;
      if (nodes.length > 0) {
        nodes.forEach((node) => {
          if (node.childNodes.length > 0) console.warn("ClipPaths may not have groups");
          clipPath.appendChild(node.cloneNode());
        });
      } else {
        const node = document.querySelector(this.props.clipPath);
        clipPath.appendChild(node.cloneNode());
      }

      this.insertAdjacentElement("afterbegin", svg);
      this.style.clipPath = `url('#${this.componentClass}-clip')`;
    } catch (e) {
      console.log(e);
      console.log("." + this.componentClass + " / " + this.props.clipPath + " failed to clip");
    }
  }

  onLoad(e) {
    console.log("image loaded");
    // console.log(e);
    if (e.currentTarget.naturalWidth) {
      this.assetWidth = e.currentTarget.naturalWidth / this.defaultDensity + "px";
      this.assetHeight = e.currentTarget.naturalHeight / this.defaultDensity + "px";
    }
    this.setCssVariables();
  }

  setCssVariables() {
    if (!getCssVar(this, "image-width")) {
      this.assetWidth && this.style.setProperty("--image-width", this.assetWidth);
      this.displayWidth && this.style.setProperty("--image-width", this.displayWidth + "px");
    }
    if (!getCssVar(this, "image-height")) {
      this.assetHeight && this.style.setProperty("--image-height", this.assetHeight);
      this.displayHeight && this.style.setProperty("--image-height", this.displayHeight + "px");
    }

    this.props.position && this.style.setProperty("--image-position", this.props.position);
    this.props.top && this.style.setProperty("--image-top", this.props.top);
    this.props.right && this.style.setProperty("--image-right", this.props.right);
    this.props.bottom && this.style.setProperty("--image-bottom", this.props.bottom);
    this.props.left && this.style.setProperty("--image-left", this.props.left);
  }
}
