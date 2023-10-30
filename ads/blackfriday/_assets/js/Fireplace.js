"use strict";

import { importAll, waitForStyles, registerComponents } from "@helpers";
import { Asset } from "@components/Asset";
import "@assets/js/utils/localconnection.min.js";

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


async function init() {
  await document.fonts.ready;
  registerComponents(Asset);
  wait();
}

async function wait() {
  await waitForStyles();
  await Promise.all($q("ad-assets").map((i) => i.loaded));
  sync();
}

function sync() {
  console.log("sync " + c9Config.frame);
  new LocalConnection({
    key: "c9Fireplace",
    name: c9Config.frame,
    frames: c9Config.frames,
    onConnect: function () {
      if (c9Config.frame === "top") { // set master frame
        LC.left.initTimeline(); // start other tl
        LC.right.initTimeline(); // start other tl
        initTimeline();
        console.log("Connection Established");
      }
    },
    timeout: 4,
    onTimeout: function () {
      initTimeline();
      console.log("Timeout " + c9Config.frame);
    },
  });
}

function initTimeline() {
  console.info("initTimeline " + c9Config.frame);

  let tl = new gsap.timeline();

  tl.set("#banner", { autoAlpha: 1 });

  if (window.location.hash === "#fallback") {
    tl.add("fallback").pause("fallback");
    window.readyForScreenshot = true;
  }
}

window.initTimeline = initTimeline;

init();