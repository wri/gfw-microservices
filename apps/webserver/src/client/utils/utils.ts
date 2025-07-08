export const getFileExtension = (fileName?: string): string => {
  if (!fileName) {
    return '';
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? `.${fileName.substring(lastDotIndex + 1)}` : '';
};

export const darkenColor = (color, amount = 20) => {
  let r, g, b;

  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (color.startsWith('rgb')) {
    [r, g, b] = color.match(/\d+/g).map(Number);
  } else {
    throw new Error('Unsupported color format');
  }

  r = Math.max(0, r - (r * amount) / 100);
  g = Math.max(0, g - (g * amount) / 100);
  b = Math.max(0, b - (b * amount) / 100);

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};
