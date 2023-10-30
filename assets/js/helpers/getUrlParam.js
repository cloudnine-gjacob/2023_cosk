/**
  Retrieves the value of a specified URL parameter.
  @param {string} param - The name of the parameter to retrieve.
  @returns {string | null} - The value of the parameter, or null if it doesn't exist.
*/
export function getUrlParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}
