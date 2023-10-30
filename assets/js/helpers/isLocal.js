/**
 * returns if env is Local
 * @type {boolean}
 */

export default function () {
  var regex = new RegExp(/(localhost:|local|lakito.de|file:|:8080|:5757|:8888)/);
  return regex.test(window.location.origin);
}
