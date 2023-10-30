export default function resizeContain(wrapper = document.querySelector("#banner"), alignX = 0, alignY = 0) {
  if (typeof wrapper === "string") {
    wrapper = document.querySelector(wrapper);
  }

  const compStyles = window.getComputedStyle(wrapper);

  window.addEventListener("resize", onResize, false);
  onResize();

  function onResize() {
    let scale;
    const sourceWidth = c9Config.bannerWidth;
    const sourceHeight = c9Config.bannerHeight;
    let targetWidth = document.body.clientWidth;
    let targetHeight = document.body.clientHeight;
    const targetMinWidth = parseInt(compStyles.getPropertyValue("min-width"));
    const targetMinHeight = parseInt(compStyles.getPropertyValue("min-height"));
    const targetMaxWidth = parseInt(compStyles.getPropertyValue("max-width"));
    const targetMaxHeight = parseInt(compStyles.getPropertyValue("max-height"));

    if (targetWidth < targetMinWidth) {
      targetWidth = targetMinWidth;
    }

    if (targetWidth > targetMaxWidth) {
      targetWidth = targetMaxWidth;
    }

    if (targetHeight < targetMinHeight) {
      targetHeight = targetMinHeight;
    }

    if (targetHeight > targetMaxHeight) {
      targetHeight = targetMaxHeight;
    }

    scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);

    //  if (scale > scaleMax) scale = scaleMax;

    wrapper.style.left = alignX + "px";
    wrapper.style.top = alignX + "px";
    //  wrapper.style.transform = `translateX(-${alignX}) translateY(-${alignY} scale(${scale}))`;
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = `${alignX} ${alignY}`;
  }
}
