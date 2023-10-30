export default function cloneSVGNode( id, scale = 1){
   try {
      let node = document.getElementById(id);
      //TweenMax.set(node, {x:0, y:0});

      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = id + '-clone';
      //svg.setAttribute('shape-rendering', 'crispEdges');
      //svg.setAttribute('preserveAspectRatio', 'xMinYMin');
      let size = node.getBBox();

      console.log('size ' + size);
      console.log('size.x ' + Math.floor(size.x));
      console.log('size.y ' + Math.floor(size.y));

      console.log('size.width ' + Math.round(size.width));
      console.log('size.height ' + Math.round(size.height));

      let x = Math.floor(size.x - 2);
      let y = Math.floor(size.y - 2);

      let width = Math.round(size.width + 4);
      if( width %4 !== 0 ){
         width = Math.round( width / 4 ) * 4;
      }
      if(width < size.width) width += 2;

      let height = Math.round(size.height + 4);
      if( height %4 !== 0 ){
         height = Math.round( height / 4 ) * 4;
      }
      if(height < size.height) height += 2;

      console.log('width ' + Math.round(width));
      console.log('height ' + Math.round(height));

      svg.setAttribute('viewBox', x + ' ' + y + ' ' + width + ' ' + height);
      svg.setAttributeNS(null, 'width',  width * scale);
      svg.setAttributeNS(null, 'height', height * scale);

      let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
      svg.appendChild(use);

      return svg;

   }catch(e){
      console.log(e);
      let div = document.createElement('div')
      return div;

   }
}