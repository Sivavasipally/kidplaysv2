export type AssetKind = 'costume' | 'sound' | 'backdrop';

export type Costume = {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type SoundAsset = {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type Backdrop = {
  id: string;
  name: string;
  color: string;
  image?: Costume;
};
