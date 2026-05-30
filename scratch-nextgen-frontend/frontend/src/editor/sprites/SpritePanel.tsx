import { Plus, Trash2 } from 'lucide-react';
import type { Project } from '../../types/project';
import type { Sprite } from '../../types/sprite';
import { AssetManager } from '../assets/AssetManager';
import { SpriteEditor } from './SpriteEditor';

type SpritePanelProps = {
  project: Project;
  activeSpriteId: string;
  onSelectSprite: (spriteId: string) => void;
  onAddSprite: () => void;
  onDeleteSprite: (spriteId: string) => void;
  onUpdateSprite: (spriteId: string, patch: Partial<Sprite>) => void;
};

export function SpritePanel({
  project,
  activeSpriteId,
  onSelectSprite,
  onAddSprite,
  onDeleteSprite,
  onUpdateSprite,
}: SpritePanelProps) {
  const activeSprite = project.sprites.find((sprite) => sprite.id === activeSpriteId) ?? project.sprites[0];

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">Sprites</h2>
          <button
            type="button"
            onClick={onAddSprite}
            className="inline-flex items-center gap-1 rounded-[8px] bg-grass px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-600"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {project.sprites.map((sprite) => {
            const costume = sprite.costumes.find((item) => item.id === sprite.currentCostumeId) ?? sprite.costumes[0];
            return (
              <button
                key={sprite.id}
                type="button"
                onClick={() => onSelectSprite(sprite.id)}
                className={`rounded-[8px] border-2 p-2 text-left transition ${
                  activeSpriteId === sprite.id
                    ? 'border-sky-500 bg-sky-50 shadow-sm'
                    : 'border-transparent bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img src={costume?.dataUrl} alt="" className="h-10 w-10 rounded object-contain" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">{sprite.name}</p>
                    <p className="text-xs text-slate-500">
                      x {Math.round(sprite.x)}, y {Math.round(sprite.y)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeSprite ? (
        <div className="space-y-3 rounded-[8px] border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800">Sprite details</h3>
            <button
              type="button"
              disabled={project.sprites.length <= 1}
              onClick={() => onDeleteSprite(activeSprite.id)}
              className="rounded-[8px] p-2 text-slate-500 hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
              title="Delete sprite"
            >
              <Trash2 size={17} />
            </button>
          </div>
          <SpriteEditor sprite={activeSprite} onUpdate={(patch) => onUpdateSprite(activeSprite.id, patch)} />
        </div>
      ) : null}

      {activeSprite ? (
        <AssetManager sprite={activeSprite} onUpdate={(patch) => onUpdateSprite(activeSprite.id, patch)} />
      ) : null}
    </div>
  );
}
