/*!
 * Original code by Antony 1983 from StackOverflow
 *
 * Attribution-ShareAlike 4.0 International Licensed, Copyright (c) 2015 Antony 1983, see https://creativecommons.org/licenses/by-sa/4.0/ for details
 *
 * Credits to the Antony 1983 team:
 * https://stackoverflow.com/questions/32141291/javascript-reflection-get-nested-objects-path
 * https://stackoverflow.com/a/32143089
 * https://stackoverflow.com/users/1094311/1983
 */
/** check if arg is object type */
export function isobject(x: unknown) {
  return Object.prototype.toString.call(x) === "[object Object]";
}

/** transform object keys in path string, arg to get functions from {radash, lodash} */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getkeys(obj: any, prefix = "") {
  if (!obj) return [] as string[];
  const keys = Object.keys(obj);
  prefix = prefix ? prefix + "." : "";
  return keys.reduce((result, key) => {
    if (isobject(obj[key])) {
      result = result.concat(getkeys(obj[key], prefix + key));
    } else {
      result.push(prefix + key);
    }
    return result;
  }, [] as string[]);
}
