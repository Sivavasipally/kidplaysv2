export type RuntimeEventName = 'greenFlag' | 'spriteClick' | 'keyPressed' | 'stopAll';

export type RuntimeEvent = {
  name: RuntimeEventName;
  spriteId?: string;
  key?: string;
};
