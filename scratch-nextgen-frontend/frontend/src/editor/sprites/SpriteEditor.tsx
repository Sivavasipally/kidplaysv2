import { Eye, EyeOff } from 'lucide-react';
import type { Sprite } from '../../types/sprite';

type SpriteEditorProps = {
  sprite: Sprite;
  onUpdate: (patch: Partial<Sprite>) => void;
};

export function SpriteEditor({ sprite, onUpdate }: SpriteEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Name
        <input
          value={sprite.name}
          onChange={(event) => onUpdate({ name: event.target.value })}
          className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
        />
      </label>
      <NumberField label="X" value={sprite.x} onChange={(value) => onUpdate({ x: value })} />
      <NumberField label="Y" value={sprite.y} onChange={(value) => onUpdate({ y: value })} />
      <NumberField label="Direction" value={sprite.direction} onChange={(value) => onUpdate({ direction: value })} />
      <NumberField label="Size" value={sprite.size} onChange={(value) => onUpdate({ size: value })} />
      <button
        type="button"
        onClick={() => onUpdate({ visible: !sprite.visible })}
        className="col-span-2 flex items-center justify-center gap-2 rounded-[8px] bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
      >
        {sprite.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        {sprite.visible ? 'Visible' : 'Hidden'}
      </button>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <input
        type="number"
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
      />
    </label>
  );
}
