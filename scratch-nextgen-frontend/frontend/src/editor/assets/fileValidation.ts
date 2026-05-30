export const imageTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
export const soundTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
export const maxImageSize = 2 * 1024 * 1024;
export const maxSoundSize = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | undefined {
  if (!imageTypes.includes(file.type)) {
    return 'Please choose a PNG, JPG, SVG, or WEBP image.';
  }

  if (file.size > maxImageSize) {
    return 'Please choose an image smaller than 2 MB.';
  }

  return undefined;
}

export function validateSoundFile(file: File): string | undefined {
  if (!soundTypes.includes(file.type)) {
    return 'Please choose an MP3, WAV, or OGG sound.';
  }

  if (file.size > maxSoundSize) {
    return 'Please choose a sound smaller than 5 MB.';
  }

  return undefined;
}

export function safeAssetName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot >= 0 ? name.slice(0, dot) : name;
  return base.replace(/[^\w -]+/g, '').trim().slice(0, 36) || 'New asset';
}
