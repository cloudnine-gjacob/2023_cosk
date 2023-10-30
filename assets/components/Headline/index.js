"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";
import { getComputedStyle, getCssVar } from "@helpers";

export class Headline extends AbstractComponent {
  static tag = "ad-headline";

  static groupProperties = {};
  static methods = {
    sizes: "sizes",
    autoSize: "autoSize",
    normalize: "normalize",
    resize: "resize",
    resizeRelative: "resizeRelative",
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.classList.add("headline");
    this.replaceTemplateTags();
    this.render();

    if (this.props.group && !Headline.groupProperties[this.props.group]) {
      Headline.groupProperties[this.props.group] = {
        sizes: [],
        autoSize: [],
        normalize: [],
        resize: [],
        resizeRelative: [],
      };
    }

    if (Headline.groupProperties[this.props.group]) {
      this.classList.add(this.props.group);
      this.groupProperties = Headline.groupProperties[this.props.group];
      this.groupProperties.autoSize.push(this.autoSize.bind(this));
      this.groupProperties.normalize.push(this.normalize.bind(this));
      this.groupProperties.resize.push(this.resize.bind(this));
      this.groupProperties.resizeRelative.push(this.resizeRelative.bind(this));
    }

    this.factor = getCssVar(this, "--factor") * 1 || this.props.factor || 1;

    if (this.props.autosize) {
      this.autoSize();
    }
  }

  render() {
    const text = this.innerHTML;
    const parser = new DOMParser();

    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    const templateContent = template.content;

    this.innerHTML = "";
    this.appendChild(templateContent);

    this.querySelector(".headline__text").innerHTML = text;
  }

  autoSize() {
    this.resized = new Promise((resolve, reject) => {
      try {
        const text = this.querySelector(".headline__text");
        let currentTextFontSize = parseInt(getComputedStyle(text, "font-size"));
        let ratio;
        let targetFontSize;

        text.style.position = "absolute";

        /**
         * get the computed wrapper width and height (after text is set to absolute).
         * if either of those values is 0, then
         * we'll assume it is set to auto, thus
         * don't try to scale it.
         */
        const wrapper = this;
        const wrapperWidth = parseInt(getComputedStyle(wrapper, "width"));
        const wrapperHeight = parseInt(getComputedStyle(wrapper, "height"));

        /**
         * only scale the width if it is not set to auto
         */
        if (!!wrapperWidth) {
          ratio = wrapperWidth / text.clientWidth;
          targetFontSize = parseInt(currentTextFontSize * ratio);
          text.style.fontSize = targetFontSize + "px";
        }

        /**
         * only scale height if
         * 1) wrapperWidth is set other then auto and text is wider than wrapper
         * 2) wrapperWidth is set to auto, but wrapperHeight isn't
         */
        if ((!!wrapperWidth && !!wrapperHeight && text.clientHeight > wrapperHeight) || (!wrapperWidth && !!wrapperHeight)) {
          currentTextFontSize = parseInt(getComputedStyle(text, "font-size"));
          ratio = wrapperHeight / text.clientHeight;
          targetFontSize = parseInt(currentTextFontSize * ratio);
          text.style.fontSize = targetFontSize + "px";
        }

        /**
         * reset position styles
         */
        if (this.factor === 1 && this.groupProperties) this.groupProperties.sizes.push(targetFontSize);
        text.style.removeProperty("position");
        resolve();
      } catch (err) {
        console.error(err);
      }
    });
  }

  resize(targetFontSize) {
    const promise = new Promise((resolve, reject) => {
      const text = this.querySelector(".headline__text");
      text.style.fontSize = targetFontSize * this.factor + "px";
      resolve();
    });
    return promise;
  }

  resizeRelative(targetFontSize) {
    const promise = new Promise((resolve, reject) => {
      const fontSize = this.getFontSize();
      const text = this.querySelector(".headline__text");
      text.style.fontSize = fontSize + targetFontSize * this.factor + "px";
      resolve();
    });
    return promise;
  }

  normalize() {
    const promise = new Promise((resolve, reject) => {
      const text = this.querySelector(".headline__text");
      const targetFontSize = Math.min(...Headline.groupProperties[this.props.group].sizes);
      text.style.fontSize = targetFontSize * this.factor + "px";
      resolve();
    });
    return promise;
  }

  getFontSize() {
    const text = this.querySelector(".headline__text");
    const currentTextFontSize = parseInt(getComputedStyle(text, "font-size"));
    return currentTextFontSize;
  }

  /**
   * Replace template tags
   * Syntax:
   *  <br:foo|bar> - break
   * {foo|bar}text or html entities{/} - can hold everything
   *
   * Supports also legacy syntaxes
   * Airlines:
   *  {/foo} - break
   *  {!foo} - s
   *  {%foo} - nonbreaking
   */
  replaceTemplateTags() {
    const template = this.props.template || c9Config.bannerTemplate;
    const defaultBreakReg = new RegExp(/<\w+:([\w\|]+)>/g);
    const defaultWrapReg = new RegExp(/{([\w|\|]+)}(.*?){\/}/g);
    const airlineBreakReg = new RegExp(/{\/([\w|\|]+)}/g);
    const airlineHyphenReg = new RegExp(/{\!([\w|\|]+)}/g);
    const airlineNonBreakReg = new RegExp(/{\%([\w|\|]+)}/g);

    let text;
    try {
      text = decodeURIComponent(escape(this.innerHTML));
    } catch (e) {
      text = decodeURIComponent(encodeURIComponent(this.innerHTML));
    }

    if ((defaultBreakReg.test(text) || defaultWrapReg.test(text)) && !template) {
      console.warn("Headline contains template tags, but bannerTemplate is not defined: " + text);
    }

    text = text
      // Default break Syntax
      .replaceAll(defaultBreakReg, function (match, matchedTemplate) {
        if (new RegExp(matchedTemplate).test(template)) return "<br>";
        return " ";
      })
      // remove automated end tag by handlebars
      .replaceAll(/<\/\w*:([\w\|]*)>/g, "")
      // Default template wrapper
      .replaceAll(defaultWrapReg, function (match, matchedTemplate, inlineMatch) {
        if (new RegExp(matchedTemplate).test(template)) return inlineMatch;
        return "";
      })
      // Airline break
      .replaceAll(airlineBreakReg, function (match, matchedTemplate) {
        if (new RegExp(matchedTemplate).test(template)) return "<br>";
        return "";
      })
      // Airline shy
      .replaceAll(airlineHyphenReg, function (match, matchedTemplate) {
        if (new RegExp(matchedTemplate).test(template)) return "&shy;";
        return "";
      })
      // Airline nonbreaking
      .replaceAll(airlineNonBreakReg, function (match, matchedTemplate) {
        if (new RegExp(matchedTemplate).test(template)) return "&nbsp;";
        return "";
      });

    // console.log(text);
    this.innerHTML = text;
  }

  static group(id, method, ...args) {
    try {
      const methods = Headline.groupProperties[id][method];
      const promises = [];
      methods.forEach((method) => promises.push(method(...args)));
      return promises;
    } catch (e) {
      console.warn("Headline group " + id + " " + method + " not valid");
    }
  }
}
