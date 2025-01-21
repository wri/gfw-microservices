export const getFileExtension = (fileName: string | null): string => {
  if (!fileName) {
    return '';
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? `.${fileName.substring(lastDotIndex + 1)}` : '';
};
