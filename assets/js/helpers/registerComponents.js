/**
 *
 * @param  {...any} componentClasses
 */
export function registerComponents(...componentClasses) {
  for (const componentClass of componentClasses) {
    if (!customElements.get(componentClass.tag)) customElements.define(componentClass.tag, componentClass);
  }
}
