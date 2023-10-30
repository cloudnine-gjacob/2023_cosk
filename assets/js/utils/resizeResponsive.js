'use strict'

import {Signal} from "signals";

export default function resizeResponsive(ratios = [
  {bp:'b16', func:function(ratio){return (ratio <= .33)}},
  {bp:'b12', func:function(ratio){return (ratio < .67)}},
  {bp:'b11', func:function(ratio){return (ratio < 1.5)}},
  {bp:'b21', func:function(ratio){return (ratio >= 1.5)}}
]){


  const signals = {
    BREAK_POINT: new Signal()
  };

  window.addEventListener('resize', onResize, false);
  onResize();


  function onResize() {
    let fluidNodes = document.querySelectorAll('.fluid');
    //cw == content height
    let cw = document.querySelector('#banner').clientWidth;
    //ch == content height
    let ch = document.querySelector('#banner').clientHeight;
    let breakPoint = getBreakpiont(cw, ch);
    for(let f = 0; f < fluidNodes.length; f++){
      setPosition(fluidNodes[f], cw, ch, breakPoint);
    }
  };


  //cw == content width
  //ch == content height
  //bp == breakpoint
  function setPosition(node, cw, ch, bp)
  {
      //bs == banner size
      let bs = c9Config.bannerSize;

      //TweenMax props obj
      let contentPosition = {};

      //f == scale factor multiplier
      //v == visibility
      //s == scale
      //cx == content x
      //cy == content y
      //px == cover offset x
      //py == cover offset y
      let scale, px, py, f, v, s, cx, cy;

      //scale proportionally / cover
      if (node.dataset['size'] == 'cover'){
          scale = Math.max(cw / bs, ch / bs);
          // px = (node.dataset['px']) = node.dataset['px'];
          // py = (node.dataset['py']) = node.dataset['py'];

          //scale proportionally / contain
      } else if ((ch / 2) < cw) {
          scale = ch / bs;
          // px = (node.dataset[bp].split(' ')[1]) ? node.dataset[bp].split(' ')[1] : 0;
          // py = (node.dataset[bp].split(' ')[2]) ? node.dataset[bp].split(' ')[2] : 0;

      } else {
          scale = cw / (bs / 2);
          // px = (node.dataset[bp].split(' ')[1]) ? node.dataset[bp].split(' ')[1] : 0;
          // py = (node.dataset[bp].split(' ')[2]) ? node.dataset[bp].split(' ')[2] : 0;

      }

      px = (node.dataset[bp].split(' ')[1]) ? node.dataset[bp].split(' ')[1] * 1 : 0;
      py = (node.dataset[bp].split(' ')[2]) ? node.dataset[bp].split(' ')[2] * 1 : 0;

      // console.log(node.id);
      // console.log('px: ' + px);
      // console.log('py: ' + py);

      f = (node.dataset[bp] == undefined) ? 1 : node.dataset[bp].split(' ')[0];
      v = (f == -1) ? 0 : 1
      s = (f == 0) ? 1 : scale * f;

      //set node scale and visibility
      contentPosition.autoAlpha = v;
      contentPosition.scale = s;
      contentPosition.transformOrigin = 'top left';

      //set node x and y positions
      switch (node.dataset['position'])
      {
          case 'tl':
              // top left
              cx = 0;
              cy = 0;
              break;

          case 'tc':
              // top center
              cx = (cw / 2) - ((bs * s) / 2);
              cy = 0;
              break;

          case 'tr':
              // top right
              cx = cw - (bs * s);
              cy = 0;
              break;

          case 'lc':
              // center center
              cx = 0;
              cy = (ch / 2) - ((bs * s) / 2);
              break;

          case 'cc':
              // center center
              cx = (cw / 2) - ((bs * s) / 2);
              cy = (ch / 2) - ((bs * s) / 2);
              break;

          case 'cr':
              // center center
              cx = cw - (bs * s);
              cy = (ch / 2) - ((bs * s) / 2);
              break;

          case 'bl':
              // bottom left
              cx = 0;
              cy = ch - (bs * s);
              break;

          case 'bc':
              // bottom center
              cx = (cw / 2) - ((bs * s) / 2);
              cy = ch - (bs * s);
              break;

          case 'br':
              // bottom right
              cx = cw - (bs * s);
              cy = ch - (bs * s);
              break;

          default:
      }

      if(node.dataset['size'] == 'cover'){
          contentPosition.x = Math.floor(cx * px);
          console.log(py);
          contentPosition.y = Math.floor(cy * py);

      }else{
          // console.log(cx);
          // console.log(cy);
          // contentPosition.x = Math.floor(cx - 50);
          // contentPosition.y = Math.floor(cy - 50);
          contentPosition.x = (cx + px);
          contentPosition.y = (cy + py);
      }


    gsap.set(node, contentPosition);

  };


  //b16: portrait < 200x600
  //b12: portrait < 400x600
  //b11: square < 600x600
  //b21: landscape > 600x500
  function getBreakpiont(cw, ch) {
    let ratio = cw / ch;
    let breakPoint;

    for(let r = 0; r < ratios.length; r++){
      let tempRatio = ratios[r];
      console.log(ratio);
      if(tempRatio.func(ratio)){
        breakPoint = tempRatio.bp;
        break;
      }
    }

    console.log(breakPoint);
    signals.BREAK_POINT.dispatch({bp:breakPoint});
    document.body.setAttribute('data-bp', breakPoint);

    return breakPoint;
  };

  return { signals, onResize, setPosition }

}