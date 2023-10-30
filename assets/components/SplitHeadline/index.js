"use strict";
import "./styles.styl";
import { Headline } from "../Headline";
import { SplitText } from "gsap/SplitText.js";

export class SplitHeadline extends Headline {
  static tag = "ad-split-headline";
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.splitIsCalled = false;

    if (this.props.split) {
      this.splitLines();
    }
  }

  
  normalize() {
    const promise = new Promise((resolve, reject) => {
      console.log("split normalize");
      const text = this.querySelector(".headline__text");
      const targetFontSize = Math.min(...Headline.groupProperties[this.props.group].sizes);
      text.style.fontSize = targetFontSize * this.factor + "px";
      if (this.localName === "ad-split-headline") {
        this.splitLines();
      }
      resolve();
    });
    return promise;
  }


  splitLines() {
    if (this.splitIsCalled) {
      console.warn("If ad-split-headline is noralized splitLines is already called. In this case remove the split props from ad-split-headline.");
    }
    this.splitIsCalled = true;

    gsap.registerPlugin(SplitText);

    this.style.height = this.querySelector(".headline__text").clientHeight + "px";

    const split = new SplitText(this.querySelector(".headline__text"), {
      type: "words,lines",
      wordsClass: `headline__word`,
      linesClass: `headline__line`,
    });

    let lineHeight = parseInt(window.getComputedStyle(split.lines[0]).lineHeight);
    if (!lineHeight) {
      console.error("Splitted headlines needs a line-height value");
    }

    /**
     * Umlaut dots at the top of capital letters would disappear due
     * to the overflow:hidden of the line-container so i am positioning
     * each line with an absolute bottom value and give it a
     * top-padding afterwards.
     *
     * it's not beautiful, but it works
     */

    split.lines.forEach((line, idx) => {
      line.style.bottom = (lineHeight * idx + lineHeight) * -1 + "px";
      line.style.paddingTop = "1em";
    });

    this.headlineSplit = split;
  }


  linesIn(duration = 0.5, staggerDelay = 0.1, ease = "power2.out") {
    let tl = gsap.timeline();

    for (let i = 0; i < this.headlineSplit.lines.length; i++) {
      const words = this.headlineSplit.lines[i].querySelectorAll(".headline__word");

      tl.from(words, { duration, y: "120%", translateZ: 0.01, ease }, `<+=${staggerDelay}`);
    }

    return tl;
  }


  linesOut(duration = 0.5, staggerDelay = 0.1, ease = "power2.in") {
    let tl = gsap.timeline();

    for (let i = 0; i < this.headlineSplit.lines.length; i++) {
      const words = this.headlineSplit.lines[i].querySelectorAll(".headline__word");

      tl.to(words, { duration, y: "120%", translateZ: 0.01, ease }, `<+=${staggerDelay}`);
    }

    return tl;
  }
}
