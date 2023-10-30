export function getCssVar(el, varName) {
  let style = getComputedStyle(el);
  let tempVarName = varName.replace("--", "");
  return style.getPropertyValue(`--${tempVarName}`);
}
