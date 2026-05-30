import type { Costume, SoundAsset } from '../../types/asset';
import { createId } from '../../utils/ids';
import { nowIso } from '../../utils/time';
import { safeAssetName } from './fileValidation';

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export async function imageFileToCostume(file: File): Promise<Costume> {
  return {
    id: createId('costume'),
    name: safeAssetName(file.name),
    dataUrl: await fileToDataUrl(file),
    mimeType: file.type,
    size: file.size,
    createdAt: nowIso(),
  };
}

export async function soundFileToAsset(file: File): Promise<SoundAsset> {
  return {
    id: createId('sound'),
    name: safeAssetName(file.name),
    dataUrl: await fileToDataUrl(file),
    mimeType: file.type,
    size: file.size,
    createdAt: nowIso(),
  };
}
