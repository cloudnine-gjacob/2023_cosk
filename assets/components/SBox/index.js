"use strict";

import AbstractComponent from "../AbstractComponent";
import "./styles.styl";

export class SBox extends AbstractComponent {
  static tag = "ad-sbox";
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();

    this.sizeParent();
  }
  sizeParent() {
    let maxWidth = 0;
    let maxHeight = 0;
    const children = this.children;

    for (let child of children) {
      maxWidth = Math.max(child.clientWidth, maxWidth);
      maxHeight = Math.max(child.clientHeight, maxHeight);
    }

    this.style.setProperty("--sbox-width", `${maxWidth}px`);
    this.style.setProperty("--sbox-height", `${maxHeight}px`);
  }
}
