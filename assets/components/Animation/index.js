"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";

import loadPNG from "../../js/utils/loadPNG";

export class Animation extends AbstractComponent {
  static tag = "ad-animation";

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    console.log("animation");

    this.shadow = this.attachShadow({ mode: "open" });

    const parser = new DOMParser();
    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    this.templateContent = template.content;
    this.innerHTML = "";
    this.shadow.appendChild(this.templateContent);

    this.classList.add("animation");
    this.loadAnimation();
  }

  loadAnimation() {
    //check for the src in the window object
    const src = this.props.src || this.props.s;
    console.log("src: " + src);

    loadPNG(
      src,
      (err) => {
        if (err) {
          console.log(err);
          // loadingError();
          return false;
        } else {
          setTimeout(() => {
            if (typeof callback === "function") {
              callback.call();
            }
          }, 10);
        }
      },
      this.shadowRoot
    );

    console.log(this.shadowRoot);

    // if (/\.png$/.test(src)) {
    //   loadPNG(
    //     src,
    //     (err) => {
    //       if (err) {
    //         console.log(err);
    //         // loadingError();
    //         return false;
    //       } else {
    //         setTimeout(() => {
    //           if (typeof callback === "function") {
    //             callback.call();
    //           }
    //         }, 10);
    //       }
    //     },
    //     this.querySelector(".banner-animation")
    //   );
    // } else {
    //   loadScript(src)
    //     .then(() => {
    //       setTimeout(() => {
    //         if (typeof callback === "function") {
    //           callback.call();
    //         }
    //       }, 10);
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //     });
    // }
  }
}
