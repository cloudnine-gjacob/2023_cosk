const iOSVersion = function () {
  if (window.MSStream) {
    // There is some iOS in Windows Phone...
    // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    return false;
  }
  var version = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  var iosVersion = parseInt(version[1], 10);

  return iosVersion;
};

export default iOSVersion;
