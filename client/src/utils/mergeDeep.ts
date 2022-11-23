// deep merge objects. see https://stackoverflow.com/a/34749873

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const isObject = (item: any): boolean => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = (target: any, ...sources: any[]): Object => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

export { mergeDeep };
