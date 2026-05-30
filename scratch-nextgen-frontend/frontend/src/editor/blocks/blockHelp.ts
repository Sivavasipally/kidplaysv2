const blockHelp: Record<string, string> = {
  event_when_green_flag: 'This block starts your story or game when you click the green flag.',
  event_when_sprite_clicked: 'This starts a script when you click the sprite on the stage.',
  event_when_key_pressed: 'This starts a script when a key is pressed.',
  motion_move_steps: 'Move steps changes where your sprite is standing.',
  motion_turn_degrees: 'Turn degrees spins your sprite.',
  motion_goto_xy: 'Go to x y teleports your sprite to a spot on the stage.',
  motion_change_x: 'Change x moves your sprite sideways.',
  motion_change_y: 'Change y moves your sprite up or down.',
  motion_if_edge_bounce: 'This helps your sprite bounce when it touches the edge.',
  looks_say_seconds: 'Say shows a speech bubble for a little while.',
  looks_think_seconds: 'Think shows a thought bubble for a little while.',
  looks_show: 'Show makes an invisible sprite appear again.',
  looks_hide: 'Hide makes the sprite invisible.',
  control_wait: 'Wait lets your sprite pause before doing the next block.',
  control_repeat: 'Repeat runs the blocks inside again and again.',
  control_forever: 'Forever keeps running until you click stop.',
  sound_play: 'Play sound starts a local sound from this sprite.',
};

export function explainBlock(blockType?: string): string {
  if (!blockType) {
    return 'Click a block to learn what it does.';
  }

  return blockHelp[blockType] ?? 'This block is ready for experimenting.';
}
