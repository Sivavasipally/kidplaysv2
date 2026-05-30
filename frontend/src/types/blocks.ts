export type TriggerType = 'greenFlag' | 'spriteClick' | 'keyPressed';

export type ScriptTrigger = {
  type: TriggerType;
  key?: string;
};

export type Instruction =
  | { type: 'moveSteps'; steps: number }
  | { type: 'turnDegrees'; degrees: number }
  | { type: 'goTo'; x: number; y: number }
  | { type: 'changeX'; amount: number }
  | { type: 'changeY'; amount: number }
  | { type: 'setX'; x: number }
  | { type: 'setY'; y: number }
  | { type: 'pointDirection'; direction: number }
  | { type: 'edgeBounce' }
  | { type: 'sayForSeconds'; message: string; seconds: number }
  | { type: 'thinkForSeconds'; message: string; seconds: number }
  | { type: 'show' }
  | { type: 'hide' }
  | { type: 'changeSize'; amount: number }
  | { type: 'setSize'; size: number }
  | { type: 'wait'; seconds: number }
  | { type: 'repeat'; times: number; instructions: Instruction[] }
  | { type: 'playSound'; name: string }
  | { type: 'stopSounds' }
  | { type: 'noop'; label: string };

export type ExecutableScript = {
  trigger: ScriptTrigger;
  instructions: Instruction[];
};
