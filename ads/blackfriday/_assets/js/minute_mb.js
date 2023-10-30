"use strict";

import { importAll, waitForStyles, registerComponents } from "@helpers";

import { Asset } from "@components/Asset";

import Teaser from "../svg/teaser-biszum.svg"

const assets = importAll(
  import.meta.webpackContext("@_assets/images", {
    recursive: false,
    regExp: LOCALE_ASSET_RGX,
    mode: "sync",
  })
);
Object.assign(assets, {"teaser": {"id": "teaser", "src": Teaser}})
window.assets = assets;
console.log(window.assets);
console.log(LOCALE_ASSET_RGX)

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

  initTimeline();
}

function initTimeline() {
  console.info("initTimeline");

  let tl = new gsap.timeline();
  
  tl.set("#banner", { autoAlpha: 1 });

  tl.from('#rotation1', { duration: 2, rotation:-30, ease:Power4.easeOut, transformOrigin:'50% 50%'}, 'bfIn')
  tl.from(['#black-center', '#friday-center'], 1, {scale:3, autoAlpha:0, filter:'blur(3px)', ease:Power4.easeOut, transformOrigin:'50% 50%', stagger: .4}, 'bfIn');

  tl.from(['#last-min', '#deals'], { duration: .5, scale: 1.5, autoAlpha: 0, filter:'blur(5px)', transformOrigin:'center center', ease:Back.easeOut, stagger: .1}, "bfIn+=.75");
  
  tl.to('#banner', {duration: 2})
  
  tl.to(['#last-min', '#deals'], 1, {scale: .9, autoAlpha: 0, filter:'blur(5px)', transformOrigin:'center center', ease:Power4.easeOut});
  
  tl.from('.product1', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'50% 25%', ease:Back.easeOut}, 'product1');
  tl.to(['#black', '#friday', '.teaser ellipse'], .1, {fill:'#fffab0'}, 'product1');
  tl.from('.teaser', { duration: .5, scale: 1.5, autoAlpha: 0, filter:'blur(5px)', transformOrigin:'center center', ease:Back.easeOut}, "product1+=.3");
  tl.from('.arrow.c9-crop', { duration: .5, scale: .2, autoAlpha:0, transformOrigin:'50% 25%', ease:Back.easeOut}, '-=.5');

  tl.to('#banner', { duration: 1.5 })
  tl.to('.product1', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'50% 25%', ease:Power4.easeIn});
  tl.from('.product2', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'50% 25%', ease:Back.easeOut}, 'product2');
  tl.to(['#black', '#friday', '.teaser ellipse'], { duration: .3, fill:'#ffd6f4'}, 'product2');

  tl.to('#banner', { duration: 1.5 })
  tl.to('.product2', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'50% 25%', ease:Power4.easeIn});
  tl.from('.product3', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'50% 25%', ease:Back.easeOut}, 'product3');
  tl.to(['#black', '#friday', '.teaser ellipse'], { duration: .3, fill:'#ffb0b0'}, 'product3');

  tl.to('#banner', { duration: 1.5 })
  tl.to(['#center-logo','.arrow'], { duration: .3, autoAlpha: 0, scale: .8, transformOrigin:'50% 50%', stagger: .01 });
  tl.from('.btn', { duration: .5, scale: .9, autoAlpha: 0, transformOrigin:'center center', ease:Back.easeOut});
  
  if (window.location.hash === "#fallback") {
    tl.add("fallback").pause("fallback");
    window.readyForScreenshot = true;
  }
}

init();
