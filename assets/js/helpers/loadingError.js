export default function loadingError(){
    document.querySelector('body').style.cssText = `
          color: white;
          font-family: "Arial";
          font-size: 11px;
          line-height: 1.3;
          padding: 10px;
          background-color: black;
          margin: 0;
      `;

    let container = document.querySelector('#banner');
    container.style.cssText = `
        opacity: 1;
        visibility; visible;
    `;

    let error = `
      <b>Why am I seeing this?</b><br>
      The Primary asset failed to load. This can happen when the ad is opened localy.<br><br>
      <b>How can I fix this?</b><br>
      Upload this ad to an ad server or use a local host.<br><br>
      <b>How can I report a problem?</b><br>
      Contant the person that provided you with this file. Include a full description of the problem with preview links, error messages, and screenshots.</b><br><br>
      This ad implements a <b>${window.c9Config.adHoster}</b> clicktag.
    `;

    container.innerHTML = error;

}