/**
 * Retrieves the computed style value of a specified CSS property for a given HTML element.
 * @param {HTMLElement} el - The HTML element for which the computed style is to be retrieved.
 * @param {string} styleProp - A string representing the CSS property whose computed style value is to be retrieved.
 * @returns {string} The computed style value of the specified CSS property for the given HTML element.
 */

export function getComputedStyle(el, styleProp) {
  /**
   * Converts hyphen-separated CSS property names to camel case.
   * @param {string} str - The string to be camelized.
   * @returns {string} The camelized string.
   */
  var camelize = function (str) {
    return str.replace(/-(\w)/g, function (str, letter) {
      return letter.toUpperCase();
    });
  };

  if (document.defaultView?.getComputedStyle) {
    return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else {
    return el.style[camelize(styleProp)];
  }
}
