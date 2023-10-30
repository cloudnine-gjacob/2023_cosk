"use strict";

/**
  Waits for styles to be loaded before resolving the promise.
  @returns {Promise<void>} - A promise that resolves when styles are loaded or rejects after a timeout.
*/

export function waitForStyles() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      let counter = 0;

      // Check if styles are loaded by querying an element with the attribute "data-styles-loaded".
      if (typeof document.querySelector("[data-styles-loaded]") !== null) {
        clearInterval(interval);
        resolve();
      }

      // Check if the counter exceeds the timeout limit (10 iterations).
      if (counter > 10) {
        clearInterval(interval);
        reject("styles timeout");
      }

      counter++;
    }, 250);
  });
}
