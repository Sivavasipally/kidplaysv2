import type { Project } from '../../types/project';
import { explainBlock } from '../blocks/blockHelp';
import { starterSuggestions, categoryNextSteps } from './suggestions';

export type BuddyHint = {
  title: string;
  body: string;
};

export function getCodeBuddyHints(project: Project, spriteId: string, selectedBlockType?: string): BuddyHint[] {
  const sprite = project.sprites.find((item) => item.id === spriteId) ?? project.sprites[0];
  const hints: BuddyHint[] = [
    {
      title: 'Selected block',
      body: explainBlock(selectedBlockType),
    },
  ];

  if (!sprite.blocksXml.includes('event_when_green_flag')) {
    hints.push({
      title: 'Starter idea',
      body: starterSuggestions[0],
    });
  }

  if (!sprite.blocksXml.includes('motion_')) {
    hints.push({
      title: 'Make it move',
      body: starterSuggestions[1],
    });
  }

  if (!sprite.visible) {
    hints.push({
      title: 'Sprite is hidden',
      body: 'Your sprite is hidden. Use the Show block or turn Visible back on.',
    });
  }

  if (Math.abs(sprite.x) > 220 || Math.abs(sprite.y) > 160) {
    hints.push({
      title: 'Near the edge',
      body: 'Your sprite is close to the edge. Try Go to x 0 y 0 or If on edge, bounce.',
    });
  }

  const category = selectedBlockType?.split('_')[0];
  if (category && categoryNextSteps[category]) {
    hints.push({
      title: 'Next block',
      body: categoryNextSteps[category],
    });
  }

  if (hints.length === 1) {
    hints.push({
      title: 'Nice start',
      body: 'Great job. Try changing a number in a block and run it again.',
    });
  }

  return hints.slice(0, 4);
}
