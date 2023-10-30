import { kebabToCamel, convertToNativeType } from "@assets/js/helpers";

export default class AbstractClass extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.props = {};

    for (const attribute of this.attributes) {
      const name = kebabToCamel(attribute.name);
      this.props[name] = convertToNativeType(attribute.value);
    }
  }
}
