'use strict';

import nodelistToArray from './nodeListToArray';

export default function sanitizeSvgUrlReferences(el){
  const childNodes = nodelistToArray(el.querySelectorAll('*'));

  console.log(el);
  console.log(childNodes);

  childNodes.forEach(childNode => {
    const childNodeAttributes = childNode.attributes;

    for (let idx = 0; idx < childNodeAttributes.length; idx++) {
      const value = childNodeAttributes[idx].value;
      const rgx = new RegExp(/url\(#/);
      const newValue = value.replace(rgx, `url(${location.href}#`);

      childNode.setAttribute(childNodeAttributes[idx].name, newValue);
    }
  })
}