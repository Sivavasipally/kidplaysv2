import { Lightbulb, Sparkles } from 'lucide-react';
import type { Project } from '../../types/project';
import { getCodeBuddyHints } from './rules';

type CodeBuddyPanelProps = {
  project: Project;
  spriteId: string;
  selectedBlockType?: string;
};

export function CodeBuddyPanel({ project, spriteId, selectedBlockType }: CodeBuddyPanelProps) {
  const hints = getCodeBuddyHints(project, spriteId, selectedBlockType);

  return (
    <section className="rounded-[8px] border border-amber-200 bg-amber-50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-[8px] bg-amber-400 p-2 text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-amber-950">Code Buddy</h2>
          <p className="text-xs font-semibold text-amber-800">Local rule helper</p>
        </div>
      </div>
      <div className="space-y-2">
        {hints.map((hint) => (
          <div key={`${hint.title}-${hint.body}`} className="rounded-[8px] bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Lightbulb size={15} className="text-amber-500" />
              {hint.title}
            </div>
            <p className="mt-1 text-sm leading-snug text-slate-600">{hint.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
