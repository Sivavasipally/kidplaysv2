import type { Costume, SoundAsset } from './asset';

export type SpriteSpeech = {
  text: string;
  expiresAt?: number;
};

export type Sprite = {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;
  size: number;
  visible: boolean;
  currentCostumeId: string;
  costumes: Costume[];
  sounds: SoundAsset[];
  blocksXml: string;
  variables: Record<string, number | string | boolean>;
  speech?: SpriteSpeech;
  color: string;
};
