"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";

export class CtaText extends AbstractComponent {
  static tag = "ad-cta-text";
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    this.render();
  }
  render() {
    let text;
    try {
      text = decodeURIComponent(escape(this.innerHTML));
    } catch (e) {
      text = decodeURIComponent(encodeURIComponent(this.innerHTML));
    }
    const parser = new DOMParser();

    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    const templateContent = template.content;

    this.innerHTML = "";
    this.appendChild(templateContent);

    this.querySelector(".cta__text").innerHTML = text;
  }
}
