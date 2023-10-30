"use strict";

import { importAll, waitForStyles, registerComponents } from "@helpers";

import { Asset } from "@components/Asset";
import { ScalingBox } from "@assets/components/ScalingBox";

const assets = importAll(
  import.meta.webpackContext("@_assets/images", {
    recursive: false,
    regExp: LOCALE_ASSET_RGX,
    mode: "sync",
  })
);
window.assets = assets;
console.log(window.assets);

const $q = gsap.utils.selector(document);
const c9Config = C9_BANNER_CONFIG;

const scalingBoxValues = {
  placeholder: {},
};

async function init() {
  await document.fonts.ready;
  registerComponents(Asset, ScalingBox);
  wait();
}

async function wait() {
  await waitForStyles();
  await Promise.all($q("ad-assets").map((i) => i.loaded));
  document.querySelector(".placeholder-cont").setup(scalingBoxValues.placeholder);
  await Promise.all($q("ad-scaling-box").map((i) => i.ready));

  initTimeline();
}

function initTimeline() {
  console.info("initTimeline");

  let tl = new gsap.timeline();

  tl.set("#banner", { autoAlpha: 1 });


  if (window.location.hash === "#fallback") {
    tl.add("fallback").pause("fallback");
    window.readyForScreenshot = true;
  }
}

init();
