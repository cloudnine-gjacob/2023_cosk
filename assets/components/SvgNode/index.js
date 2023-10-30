"use strict";

import "./styles.styl";
import AbstractComponent from "../AbstractComponent";

export class SvgNode extends AbstractComponent {
  static tag = "ad-svg-node";
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add(this.props.node.replace("#", "").replace(".", ""));
    this.render();
  }

  render() {
    try {
      let node = document.querySelector(this.props.node);
      let size = node.getBBox();

      let x = size.x;
      let y = size.y;
      let width = size.width;
      let height = size.height;

      let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", x + " " + y + " " + width + " " + height);
      svg.setAttributeNS(null, "width", width);
      svg.setAttributeNS(null, "height", height);

      this.appendChildrenRecursively(node, svg);
      this.appendChild(svg);

      this.style.setProperty("--svg-width", width);
      this.style.setProperty("--svg-height", height);

      this.setCssVariables();
    } catch (e) {
      console.log(e);
    }
  }

  appendChildrenRecursively(src, dest) {
    src.childNodes.forEach((child) => {
      let clonedChild = child.cloneNode();
      dest.appendChild(clonedChild);
      this.appendChildrenRecursively(child, clonedChild); // Recursive call
    });
  }

  setCssVariables() {
    this.props.position && this.style.setProperty("--svg-position", this.props.position);
    this.props.width && this.style.setProperty("--svg-width", this.props.width);
    this.props.height && this.style.setProperty("--svg-height", this.props.height);
    this.props.top && this.style.setProperty("--svg-top", this.props.top);
    this.props.right && this.style.setProperty("--svg-right", this.props.right);
    this.props.bottom && this.style.setProperty("--svg-bottom", this.props.bottom);
    this.props.left && this.style.setProperty("--svg-left", this.props.left);
  }
}
