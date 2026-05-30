import type { Instruction } from '../../types/blocks';
import type { Project } from '../../types/project';
import type { Sprite } from '../../types/sprite';
import { useProjectStore } from '../../store/projectStore';
import { useRuntimeStore } from '../../store/runtimeStore';
import { buildExecutableScripts } from './instructionBuilder';
import { waitFor, yieldFrame } from './scheduler';
import { bouncedDirection, isSpriteOnEdge, normalizeDirection } from '../stage/collision';
import { clampToStage } from '../stage/stageMath';

const activeAudio = new Set<HTMLAudioElement>();

export function startGreenFlagRun(project: Project): void {
  const runToken = useRuntimeStore.getState().startRun();
  const scripts = collectScripts(project, 'greenFlag');

  if (scripts.length === 0) {
    useRuntimeStore.getState().addLog('Add a green flag block to start.');
    useRuntimeStore.getState().stopRun();
    return;
  }

  useProjectStore.getState().mutateCurrentProject((draft) => {
    draft.sprites.forEach((sprite) => {
      sprite.speech = undefined;
    });
  }, { persist: false, touch: false });

  Promise.all(scripts.map((script) => runInstructions(script.spriteId, script.instructions, runToken))).then(() => {
    if (useRuntimeStore.getState().runToken === runToken) {
      useRuntimeStore.getState().addLog('Project finished.');
      useRuntimeStore.setState({ status: 'idle' });
    }
  });
}

export function startSpriteClickRun(project: Project, spriteId: string): void {
  const runToken =
    useRuntimeStore.getState().status === 'running'
      ? useRuntimeStore.getState().runToken
      : useRuntimeStore.getState().startRun();
  const scripts = collectScripts(project, 'spriteClick').filter((script) => script.spriteId === spriteId);

  if (scripts.length === 0) {
    useRuntimeStore.getState().addLog('That sprite has no click script yet.');
    return;
  }

  void Promise.all(scripts.map((script) => runInstructions(script.spriteId, script.instructions, runToken))).then(() => {
    if (useRuntimeStore.getState().runToken === runToken) {
      useRuntimeStore.setState({ status: 'idle' });
    }
  });
}

export function startKeyRun(project: Project, key: string): void {
  const runToken =
    useRuntimeStore.getState().status === 'running'
      ? useRuntimeStore.getState().runToken
      : useRuntimeStore.getState().startRun();
  const scripts = collectScripts(project, 'keyPressed').filter((script) => script.key === key);

  if (scripts.length === 0) {
    return;
  }

  void Promise.all(scripts.map((script) => runInstructions(script.spriteId, script.instructions, runToken))).then(() => {
    if (useRuntimeStore.getState().runToken === runToken) {
      useRuntimeStore.setState({ status: 'idle' });
    }
  });
}

export function stopAllScripts(): void {
  stopSounds();
  useRuntimeStore.getState().stopRun();
  useProjectStore.getState().mutateCurrentProject((project) => {
    project.sprites.forEach((sprite) => {
      sprite.speech = undefined;
    });
  }, { persist: false, touch: false });
}

async function runInstructions(spriteId: string, instructions: Instruction[], runToken: number): Promise<void> {
  for (const instruction of instructions) {
    if (useRuntimeStore.getState().runToken !== runToken) {
      return;
    }

    await runInstruction(spriteId, instruction, runToken);
    await yieldFrame(runToken);
  }
}

async function runInstruction(spriteId: string, instruction: Instruction, runToken: number): Promise<void> {
  switch (instruction.type) {
    case 'moveSteps':
      updateSprite(spriteId, (sprite) => {
        const radians = (sprite.direction * Math.PI) / 180;
        const next = clampToStage(
          sprite.x + Math.sin(radians) * instruction.steps,
          sprite.y + Math.cos(radians) * instruction.steps,
          sprite.size,
        );
        sprite.x = Math.round(next.x);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'turnDegrees':
      updateSprite(spriteId, (sprite) => {
        sprite.direction = normalizeDirection(sprite.direction + instruction.degrees);
      });
      break;
    case 'goTo':
      updateSprite(spriteId, (sprite) => {
        const next = clampToStage(instruction.x, instruction.y, sprite.size);
        sprite.x = Math.round(next.x);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'changeX':
      updateSprite(spriteId, (sprite) => {
        const next = clampToStage(sprite.x + instruction.amount, sprite.y, sprite.size);
        sprite.x = Math.round(next.x);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'changeY':
      updateSprite(spriteId, (sprite) => {
        const next = clampToStage(sprite.x, sprite.y + instruction.amount, sprite.size);
        sprite.x = Math.round(next.x);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'setX':
      updateSprite(spriteId, (sprite) => {
        const next = clampToStage(instruction.x, sprite.y, sprite.size);
        sprite.x = Math.round(next.x);
      });
      break;
    case 'setY':
      updateSprite(spriteId, (sprite) => {
        const next = clampToStage(sprite.x, instruction.y, sprite.size);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'pointDirection':
      updateSprite(spriteId, (sprite) => {
        sprite.direction = normalizeDirection(instruction.direction);
      });
      break;
    case 'edgeBounce':
      updateSprite(spriteId, (sprite) => {
        if (isSpriteOnEdge(sprite)) {
          sprite.direction = bouncedDirection(sprite);
        }
        const next = clampToStage(sprite.x, sprite.y, sprite.size);
        sprite.x = Math.round(next.x);
        sprite.y = Math.round(next.y);
      });
      break;
    case 'sayForSeconds':
    case 'thinkForSeconds':
      updateSprite(spriteId, (sprite) => {
        sprite.speech = { text: instruction.message };
      });
      useRuntimeStore.getState().addLog(`${spriteName(spriteId)} says "${instruction.message}".`);
      if (!(await waitFor(instruction.seconds, runToken))) {
        return;
      }
      updateSprite(spriteId, (sprite) => {
        sprite.speech = undefined;
      });
      break;
    case 'show':
      updateSprite(spriteId, (sprite) => {
        sprite.visible = true;
      });
      break;
    case 'hide':
      updateSprite(spriteId, (sprite) => {
        sprite.visible = false;
      });
      break;
    case 'changeSize':
      updateSprite(spriteId, (sprite) => {
        sprite.size = Math.max(5, Math.min(300, sprite.size + instruction.amount));
      });
      break;
    case 'setSize':
      updateSprite(spriteId, (sprite) => {
        sprite.size = Math.max(5, Math.min(300, instruction.size));
      });
      break;
    case 'wait':
      await waitFor(instruction.seconds, runToken);
      break;
    case 'repeat':
      for (let index = 0; index < instruction.times; index += 1) {
        if (useRuntimeStore.getState().runToken !== runToken) {
          return;
        }
        await runInstructions(spriteId, instruction.instructions, runToken);
      }
      break;
    case 'playSound':
      playSpriteSound(spriteId, instruction.name);
      break;
    case 'stopSounds':
      stopSounds();
      break;
    case 'noop':
      useRuntimeStore.getState().addLog(`Skipped ${instruction.label}.`);
      break;
    default:
      break;
  }
}

function updateSprite(spriteId: string, mutator: (sprite: Sprite) => void): void {
  useProjectStore.getState().mutateCurrentProject((project) => {
    const sprite = project.sprites.find((item) => item.id === spriteId);
    if (sprite) {
      mutator(sprite);
    }
  }, { persist: false, touch: false });
}

function collectScripts(project: Project, triggerType: 'greenFlag' | 'spriteClick' | 'keyPressed') {
  return project.sprites.flatMap((sprite) =>
    buildExecutableScripts(sprite.blocksXml)
      .filter((script) => script.trigger.type === triggerType)
      .map((script) => ({
        spriteId: sprite.id,
        key: script.trigger.key,
        instructions: script.instructions,
      })),
  );
}

function spriteName(spriteId: string): string {
  const sprite = useProjectStore.getState().currentProject?.sprites.find((item) => item.id === spriteId);
  return sprite?.name ?? 'Sprite';
}

function playSpriteSound(spriteId: string, soundName: string): void {
  const sprite = useProjectStore.getState().currentProject?.sprites.find((item) => item.id === spriteId);
  const sound = sprite?.sounds.find((item) => item.name.toLowerCase() === soundName.toLowerCase()) ?? sprite?.sounds[0];

  if (!sound) {
    useRuntimeStore.getState().addLog('No local sound is attached to this sprite yet.');
    return;
  }

  const audio = new Audio(sound.dataUrl);
  activeAudio.add(audio);
  audio.addEventListener('ended', () => activeAudio.delete(audio), { once: true });
  void audio.play();
}

function stopSounds(): void {
  activeAudio.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudio.clear();
}
