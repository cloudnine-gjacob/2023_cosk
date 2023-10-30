"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";

export class CtaImage extends AbstractComponent {
  static tag = "ad-cta-image";
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    this.render();
  }
  render() {
    const parser = new DOMParser();

    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    const templateContent = template.content;

    templateContent.querySelector(".cta--idle").setAttribute("src", this.props.assetId);
    templateContent.querySelector(".cta--hover").setAttribute("src", this.props.assetIdHover);

    this.appendChild(templateContent);
  }
}
