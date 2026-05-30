import type { Costume } from '../types/asset';
import type { Sprite } from '../types/sprite';
import { createId } from '../utils/ids';
import { nowIso } from '../utils/time';
import { defaultBlocksXml } from '../editor/blocks/toolbox';

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createDefaultCostume(color = '#F97316'): Costume {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="none"/>
      <circle cx="80" cy="78" r="46" fill="${color}"/>
      <circle cx="62" cy="66" r="7" fill="#111827"/>
      <circle cx="98" cy="66" r="7" fill="#111827"/>
      <path d="M58 94 Q80 115 102 94" fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round"/>
      <path d="M36 44 L56 20 L66 54 Z" fill="${color}"/>
      <path d="M124 44 L104 20 L94 54 Z" fill="${color}"/>
      <circle cx="126" cy="104" r="13" fill="#FDE68A"/>
      <path d="M125 92 L129 103 L141 103 L131 110 L135 122 L125 115 L115 122 L119 110 L109 103 L121 103 Z" fill="#F59E0B"/>
    </svg>
  `;

  return {
    id: createId('costume'),
    name: 'Sunny Sprite',
    dataUrl: svgDataUrl(svg),
    mimeType: 'image/svg+xml',
    size: svg.length,
    createdAt: nowIso(),
  };
}

export function createStarterSprite(name = 'Sunny'): Sprite {
  const costume = createDefaultCostume();

  return {
    id: createId('sprite'),
    name,
    x: 0,
    y: 0,
    direction: 90,
    size: 100,
    visible: true,
    currentCostumeId: costume.id,
    costumes: [costume],
    sounds: [],
    blocksXml: defaultBlocksXml,
    variables: {},
    color: '#F97316',
  };
}
