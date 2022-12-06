export const objectHasOwnProperty = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);
