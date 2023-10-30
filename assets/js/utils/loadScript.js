const loadScript = (src, async = true, type = 'text/javascript') => {
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement('script');
      const container = document.head || document.body;

      el.type = type;
      el.async = async;
      el.src = src;

      el.addEventListener('load', () => {
        resolve({ status: true });
      });

      el.addEventListener('error', () => {
        reject({
          status: false,
          message: `Failed to load the script ${src}`,
        });
      });

      container.appendChild(el);
    } catch (err) {
      reject(err);
    }
  });
};

export default loadScript;
