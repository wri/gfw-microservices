export const areArraysEqual = (arr1: [], arr2: []): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.slice().sort().toString() === arr2.slice().sort().toString();
};
