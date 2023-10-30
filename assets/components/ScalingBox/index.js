"use strict";

import "./styles.styl";
import AbstractComponent from "../AbstractComponent";

export class ScalingBox extends AbstractComponent {
  static tag = "ad-scaling-box";

  // p == pin
  // r == ratio
  // f == scale factor
  // x == x offset
  // y == y offset
  // v == visibility
  defaultValues = {
    b16: { p: "", r: 0.2, f: 1, x: 0, y: 0, a: 0, tx: 50, ty: 50, v: 1 },
    b12: { p: "", r: 0.5, f: 1, x: 0, y: 0, a: 0, tx: 50, ty: 50, v: 1 },
    b34: { p: "", r: 0.75, f: 1, x: 0, y: 0, a: 0, tx: 50, ty: 50, v: 1 },
    b11: { p: "", r: 1, f: 1, x: 0, y: 0, a: 0, tx: 50, ty: 50, v: 1 },
    b21: { p: "", r: 1.5, f: 1, x: 0, y: 0, a: 0, tx: 50, ty: 50, v: 1 },
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    //set size to contain if not in props
    this.size = this.props.size ? this.props.size : "contain";

    const defaultPin = this.parentElement.id === "banner" ? "tl" : "to";
    Object.entries(this.defaultValues).forEach(([key, value]) => {
      value.p = this.props.pin ? this.props.pin : defaultPin;

      //cover only works with pin cc x 1, y 1 is from the center
      // < 1 is the offset in percent to 0
      // > 1 is the offset in percent to 2 or 100
      if (this.size === "cover") {
        value.p = "cc";
        value.x = 1;
        value.y = 1;
      }
    });
  }

  setup(customValues) {
    this.ready = new Promise((resolve, reject) => {
      try {
        const updatedValues = this.updateDefaults(this.defaultValues, customValues);

        //convert object values to arrays
        this.valuesArray = {};
        Object.entries(updatedValues).forEach(([breakpoint, values]) => {
          //add an array for breakpoint names
          this.valuesArray.b = (this.valuesArray.b || []).concat(breakpoint);

          //add an array for each property
          Object.entries(values).forEach(([property, value]) => {
            this.valuesArray[property] = (this.valuesArray[property] || []).concat(value);
          });
        });

        window.addEventListener("resize", this.onResize.bind(this), false);
        this.onResize();
        resolve();
      } catch (e) {
        console.log(e);
        console.log("Scaling box " + this.props.class + " failed to setup");
      }
    });
  }

  //updates the default values with any changes in the custom values
  updateDefaults(defaultValues, customValues) {
    for (const key in customValues) {
      if (defaultValues.hasOwnProperty(key)) {
        if (typeof defaultValues[key] === "object" && typeof customValues[key] === "object") {
          this.updateDefaults(defaultValues[key], customValues[key]); // Recursively update nested objects
        } else {
          defaultValues[key] = customValues[key]; // Update non-nested values
        }
      }
    }
    return defaultValues;
  }

  onResize() {
    //bs == banner size
    const bs = 1200;

    //cw == content height
    const cw = document.querySelector("#banner").clientWidth;
    //ch == content height
    const ch = document.querySelector("#banner").clientHeight;
    //cr == size ration width / height
    const cr = cw / ch;
    // console.log("cr " + cr);

    //gsap props obj to fill
    const gsapValues = {};

    //s == scale
    //f == scale factor multiplier
    //b == current breakpoint index
    //cx == content x based on pin
    //cy == content y based on pin
    //px == pin offset x
    //py == pin offset y
    //a == pin offset y
    //tx == transform x
    //ty == transform y
    let s, f, b, px, py, a, tx, ty;

    const fValue = this.getAverageValue(this.valuesArray.r, this.valuesArray.f, cr, "scale");

    //get breakpoint index from average and set data on compnent
    b = fValue.breakpoint;
    this.setAttribute("data-bp", this.valuesArray.b[b]);
    console.log(this.valuesArray.b[b]);

    //set node visibility
    gsapValues.autoAlpha = this.valuesArray.v[b];

    //setup pin x and y offsets
    px = this.getAverageValue(this.valuesArray.r, this.valuesArray.x, cr).average;
    py = this.getAverageValue(this.valuesArray.r, this.valuesArray.y, cr).average;

    //set node x and y positions based on pin
    const pin = this.valuesArray.p[b];

    //set scale values for pinned boxes
    if (pin !== "to") {
      gsapValues.transformOrigin = "top left";
      this.style.width = "1200px";
      this.style.height = "1200px";

      //set node scale
      // scale proportionally / cover
      if (this.size == "cover") {
        s = Math.max(cw / bs, ch / bs);
      } else if (ch / 2 < cw) {
        s = ch / bs;
      } else {
        s = cw / (bs / 2);
      }

      f = fValue.average;
      //0 == no scale value should be 1 / 100
      s = this.valuesArray.f[b] === 0 ? 1 : s * f;
      gsapValues.scale = s;

      let { cx, cy } = this.calculatePin(pin, bs, s, cw, ch);

      gsapValues.x = this.size == "cover" ? Math.floor(cx * px) : cx + px;
      gsapValues.y = this.size == "cover" ? Math.floor(cy * py) : cy + py;
    } else {
      if (this.clientWidth === 0 || this.clientHeight === 0) console.log("width and height must be set on: " + this.classList);

      //set transform origin
      tx = this.getAverageValue(this.valuesArray.r, this.valuesArray.tx, cr).average;
      ty = this.getAverageValue(this.valuesArray.r, this.valuesArray.ty, cr).average;
      gsapValues.transformOrigin = `${tx}% ${ty}%`;

      //set cale
      gsapValues.scale = fValue.average;

      //set rotation angle
      a = this.getAverageValue(this.valuesArray.r, this.valuesArray.a, cr).average;
      gsapValues.rotation = a;

      //set x and y position
      gsapValues.x = px;
      gsapValues.y = py;
    }

    gsap.set(this, gsapValues);
  }

  calculatePin(pin, bs, s, cw, ch) {
    let cx, cy;

    switch (pin) {
      case "tl":
        // top left
        cx = 0;
        cy = 0;
        break;

      case "tc":
        // top center
        cx = cw / 2 - (bs * s) / 2;
        cy = 0;
        break;

      case "tr":
        // top right
        cx = cw - bs * s;
        cy = 0;
        break;

      case "lc":
        // left center
        cx = 0;
        cy = ch / 2 - (bs * s) / 2;
        break;

      case "cc":
        // center center
        cx = cw / 2 - (bs * s) / 2;
        cy = ch / 2 - (bs * s) / 2;
        break;

      case "cr":
        // center right
        cx = cw - bs * s;
        cy = ch / 2 - (bs * s) / 2;
        break;

      case "bl":
        // bottom left
        cx = 0;
        cy = ch - bs * s;
        break;

      case "bc":
        // bottom center
        cx = cw / 2 - (bs * s) / 2;
        cy = ch - bs * s;
        break;

      case "br":
        // bottom right
        cx = cw - bs * s;
        cy = ch - bs * s;
        break;

      default:
    }

    return { cx: cx, cy: cy };
  }

  getAverageValue(ratios, values, currentRatio, type) {
    // console.log(currentRatio);

    const tempValue = {};

    if (currentRatio <= ratios[0]) {
      tempValue.average = values[0];
      tempValue.breakpoint = 0;
      return tempValue; // Cap at the bottom
    }

    if (currentRatio >= ratios[ratios.length - 1]) {
      tempValue.average = values[values.length - 1];
      tempValue.breakpoint = values.length - 1;
      return tempValue; // Cap at the top
    }

    let lowerIndex = 0;
    let upperIndex = 0;

    // Find the two closest elements in the ratios array
    for (let i = 0; i < ratios.length; i++) {
      if (ratios[i] <= currentRatio) {
        lowerIndex = i;
        upperIndex = i + 1;
      }
    }

    // Calculate the corresponding values
    let lowerValue = values[lowerIndex];
    let upperValue = values[upperIndex];

    const lowerRatio = ratios[lowerIndex];
    const upperRatio = ratios[upperIndex];
    const weight = (currentRatio - lowerRatio) / (upperRatio - lowerRatio);
    let averageValue = lowerValue + weight * (upperValue - lowerValue);

    if (type === "scale" && (lowerValue === 0 || upperValue === 0)) {
      averageValue = Math.max(lowerValue, upperValue);
    }

    tempValue.average = averageValue;
    // console.log("weight: " + weight);
    tempValue.breakpoint = weight >= 0.5 ? upperIndex : lowerIndex;
    // console.log(tempValue.breakpoint);

    return tempValue;
  }
}
