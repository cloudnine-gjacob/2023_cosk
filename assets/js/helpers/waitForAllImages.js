/**
 * Waits for all images on the page to load or error out.
 *
 * @returns {Promise} A Promise that resolves when all images have either loaded successfully or failed to load.
 */
export async function waitForAllImages() {
  await Promise.all(
    Array.from(document.images)
      .filter((img) => !img.complete)
      .map((img) => {
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      })
  );
}
