
const locks = {};

/**
 * execute the given function sequentially for the given key
 * @param {string} key 
 * @param {Function} fn 
 */
export const withLock = (key, fn) => {
  const currentLock = locks[key] || Promise.resolve();
  
  const nextLock = currentLock
    .catch(() => {}) // Ignore errors from previous task
    .then(() => fn())
    .finally(() => {
      // Cleanup if we are the last one? 
      // Not strictly necessary for simple version, memory leak if millions of keys.
      // For room ids, we can clean up if logs[key] === nextLock.
      if (locks[key] === nextLock) {
         delete locks[key];
      }
    });

  locks[key] = nextLock;
  return nextLock;
}
