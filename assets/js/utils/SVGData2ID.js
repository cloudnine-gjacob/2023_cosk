/*
 * SVG ID normalizer
 * moves data name to ID
 *
 * @param {element} svg to fix
 */
export default function svgData2ID( element ){
  let elements = document.querySelector(element);
  let validNodes = elements.getElementsByTagName('*');
  for(let n = 0; n < validNodes.length; n++){
    let tempNode = validNodes[n];
    let tempId = tempNode.id;
    let tempName = tempNode.getAttribute('data-name')

    if(tempId && tempName){
      tempNode.id = tempName;
    }
  }
}
