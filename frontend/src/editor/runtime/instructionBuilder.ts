import type { ExecutableScript, Instruction, ScriptTrigger } from '../../types/blocks';

export function buildExecutableScripts(blocksXml: string): ExecutableScript[] {
  if (!blocksXml.trim()) {
    return [];
  }

  const document = new DOMParser().parseFromString(blocksXml, 'text/xml');
  const root = document.documentElement;

  if (root.querySelector('parsererror')) {
    return [];
  }

  return Array.from(root.children)
    .filter((child) => localName(child) === 'block')
    .map((block) => buildScript(block as Element))
    .filter((script): script is ExecutableScript => Boolean(script));
}

function buildScript(block: Element): ExecutableScript | undefined {
  const trigger = triggerFor(block);
  if (!trigger) {
    return undefined;
  }

  return {
    trigger,
    instructions: parseNextBlock(block),
  };
}

function triggerFor(block: Element): ScriptTrigger | undefined {
  const type = block.getAttribute('type');

  if (type === 'event_when_green_flag') {
    return { type: 'greenFlag' };
  }

  if (type === 'event_when_sprite_clicked') {
    return { type: 'spriteClick' };
  }

  if (type === 'event_when_key_pressed') {
    return { type: 'keyPressed', key: getField(block, 'KEY', 'Space') };
  }

  return undefined;
}

function parseNextBlock(block: Element): Instruction[] {
  const next = directChild(block, 'next');
  const childBlock = next ? firstBlockChild(next) : undefined;
  return childBlock ? parseInstructionChain(childBlock) : [];
}

function parseInstructionChain(block: Element): Instruction[] {
  const current = instructionFor(block);
  const next = parseNextBlock(block);
  return [...current, ...next];
}

function instructionFor(block: Element): Instruction[] {
  switch (block.getAttribute('type')) {
    case 'motion_move_steps':
      return [{ type: 'moveSteps', steps: getNumberField(block, 'STEPS', 10) }];
    case 'motion_turn_degrees':
      return [{ type: 'turnDegrees', degrees: getNumberField(block, 'DEGREES', 15) }];
    case 'motion_goto_xy':
      return [
        {
          type: 'goTo',
          x: getNumberField(block, 'X', 0),
          y: getNumberField(block, 'Y', 0),
        },
      ];
    case 'motion_change_x':
      return [{ type: 'changeX', amount: getNumberField(block, 'DX', 10) }];
    case 'motion_change_y':
      return [{ type: 'changeY', amount: getNumberField(block, 'DY', 10) }];
    case 'motion_set_x':
      return [{ type: 'setX', x: getNumberField(block, 'X', 0) }];
    case 'motion_set_y':
      return [{ type: 'setY', y: getNumberField(block, 'Y', 0) }];
    case 'motion_point_direction':
      return [{ type: 'pointDirection', direction: getNumberField(block, 'DIRECTION', 90) }];
    case 'motion_if_edge_bounce':
      return [{ type: 'edgeBounce' }];
    case 'looks_say_seconds':
      return [
        {
          type: 'sayForSeconds',
          message: getField(block, 'MESSAGE', 'Hello!'),
          seconds: getNumberField(block, 'SECONDS', 2),
        },
      ];
    case 'looks_think_seconds':
      return [
        {
          type: 'thinkForSeconds',
          message: getField(block, 'MESSAGE', 'Hmm...'),
          seconds: getNumberField(block, 'SECONDS', 2),
        },
      ];
    case 'looks_show':
      return [{ type: 'show' }];
    case 'looks_hide':
      return [{ type: 'hide' }];
    case 'looks_change_size':
      return [{ type: 'changeSize', amount: getNumberField(block, 'AMOUNT', 10) }];
    case 'looks_set_size':
      return [{ type: 'setSize', size: getNumberField(block, 'SIZE', 100) }];
    case 'sound_play':
      return [{ type: 'playSound', name: getField(block, 'SOUND', 'pop') }];
    case 'sound_stop_all':
      return [{ type: 'stopSounds' }];
    case 'control_wait':
      return [{ type: 'wait', seconds: getNumberField(block, 'SECONDS', 1) }];
    case 'control_repeat':
      return [
        {
          type: 'repeat',
          times: Math.min(1000, Math.max(0, getNumberField(block, 'TIMES', 10))),
          instructions: parseStatement(block, 'DO'),
        },
      ];
    case 'control_forever':
      return [
        {
          type: 'repeat',
          times: 1000,
          instructions: parseStatement(block, 'DO'),
        },
      ];
    default:
      return [{ type: 'noop', label: block.getAttribute('type') ?? 'unknown block' }];
  }
}

function parseStatement(block: Element, name: string): Instruction[] {
  const statement = Array.from(block.children).find(
    (child) => localName(child) === 'statement' && child.getAttribute('name') === name,
  );
  const childBlock = statement ? firstBlockChild(statement) : undefined;
  return childBlock ? parseInstructionChain(childBlock) : [];
}

function getNumberField(block: Element, name: string, fallback: number): number {
  const value = Number(getField(block, name, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function getField(block: Element, name: string, fallback: string): string {
  const field = Array.from(block.children).find(
    (child) => localName(child) === 'field' && child.getAttribute('name') === name,
  );
  return field?.textContent ?? fallback;
}

function directChild(element: Element, name: string): Element | undefined {
  return Array.from(element.children).find((child) => localName(child) === name) as Element | undefined;
}

function firstBlockChild(element: Element): Element | undefined {
  return Array.from(element.children).find((child) => localName(child) === 'block') as Element | undefined;
}

function localName(element: Element): string {
  return element.localName.toLowerCase();
}
