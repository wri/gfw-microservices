export function generateRandomFilename(extension, defaultLength = 10): string {
  const randomPart = Math.random().toString(36).substring(2, defaultLength);

  if (extension) {
    return `${randomPart}.${extension}`;
  } else {
    return randomPart;
  }
}
