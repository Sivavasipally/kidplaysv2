import { useEffect, useMemo } from 'react';
import { ArrowLeft, Flag, RotateCcw, Save, Square } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlocklyWorkspace } from '../editor/blocks/BlocklyWorkspace';
import { paletteCategories } from '../editor/blocks/toolbox';
import { StageCanvas } from '../editor/stage/StageCanvas';
import { SpritePanel } from '../editor/sprites/SpritePanel';
import { CodeBuddyPanel } from '../editor/codeBuddy/CodeBuddyPanel';
import {
  startGreenFlagRun,
  startKeyRun,
  startSpriteClickRun,
  stopAllScripts,
} from '../editor/runtime/interpreter';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { useProjectStore } from '../store/projectStore';
import { useRuntimeStore } from '../store/runtimeStore';
import { useUiStore } from '../store/uiStore';
import type { Sprite } from '../types/sprite';

export function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    currentProject,
    loadProject,
    saveCurrentProject,
    selectSprite,
    setSpriteBlocks,
    addSprite,
    deleteSprite,
    updateSprite,
    resetRuntimeState,
  } = useProjectStore();
  const { status, logs } = useRuntimeStore();
  const { selectedBlockType, setSelectedBlockType } = useUiStore();

  useEffect(() => {
    if (projectId) {
      void loadProject(projectId).then((project) => {
        if (!project) {
          navigate('/');
        }
      });
    }
  }, [projectId, loadProject, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentProject || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      startKeyRun(currentProject, event.key === ' ' ? 'Space' : event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject]);

  const activeSprite = useMemo(() => {
    return currentProject?.sprites.find((sprite) => sprite.id === currentProject.activeSpriteId) ?? currentProject?.sprites[0];
  }, [currentProject]);

  if (!currentProject || !activeSprite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-[8px] bg-white p-6 text-center shadow-soft">
          <p className="text-lg font-black text-slate-800">Loading project...</p>
        </div>
      </main>
    );
  }

  const runProject = () => startGreenFlagRun(currentProject);
  const stopProject = () => stopAllScripts();
  const updateActiveSprite = (spriteId: string, patch: Partial<Sprite>) => updateSprite(spriteId, patch);

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 xl:h-dvh xl:overflow-hidden">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 shadow-sm sm:gap-3 sm:px-4">
        <IconButton label="Back to dashboard" icon={<ArrowLeft size={20} />} onClick={() => navigate('/')} />
        <div className="min-w-0 flex-1 basis-[180px]">
          <h1 className="truncate text-lg font-black text-slate-950 sm:text-xl">{currentProject.name}</h1>
          <p className="hidden text-xs font-bold uppercase tracking-wide text-slate-500 sm:block">
            Frontend-only project stored in IndexedDB
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
          <Button tone="success" icon={<Flag size={18} />} onClick={runProject} disabled={status === 'running'} className="px-3">
            Run
          </Button>
          <Button tone="danger" icon={<Square size={17} />} onClick={stopProject} className="px-3">
            Stop
          </Button>
          <Button
            tone="secondary"
            icon={<RotateCcw size={17} />}
            onClick={() => {
              stopProject();
              resetRuntimeState();
            }}
            className="px-3"
          >
            Reset
          </Button>
          <Button tone="secondary" icon={<Save size={17} />} onClick={() => void saveCurrentProject()} className="px-3">
            Save
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 p-2 sm:p-3 md:grid-cols-[220px_minmax(0,1fr)] xl:min-h-0 xl:grid-cols-[240px_minmax(420px,1fr)_390px] xl:overflow-hidden">
        <aside className="order-2 max-h-[320px] min-h-0 overflow-y-auto rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm md:order-1 md:max-h-none xl:h-full">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-600">Block palette</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            {paletteCategories.map((category) => (
              <div key={category.name} className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 rounded-full ${category.color}`} />
                  <span className="font-black text-slate-800">{category.name}</span>
                </div>
                <p className="mt-1 text-sm leading-snug text-slate-500">{category.hint}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="order-1 min-h-[440px] rounded-[8px] border border-slate-200 bg-white p-2 shadow-sm sm:min-h-[560px] md:order-2 xl:h-full xl:min-h-0">
          <BlocklyWorkspace
            key={activeSprite.id}
            spriteId={activeSprite.id}
            blocksXml={activeSprite.blocksXml}
            onChange={(xml) => setSpriteBlocks(activeSprite.id, xml)}
            onSelectBlock={setSelectedBlockType}
          />
        </section>

        <aside className="order-3 min-h-0 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-3 shadow-sm md:col-span-2 xl:col-span-1 xl:h-full">
          <div className="grid gap-4 md:grid-cols-2 xl:block xl:space-y-4">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">Stage</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    status === 'running' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {status === 'running' ? 'Running' : 'Ready'}
                </span>
              </div>
              <StageCanvas
                project={currentProject}
                onSpriteClick={(spriteId) => startSpriteClickRun(currentProject, spriteId)}
              />
            </section>

            <SpritePanel
              project={currentProject}
              activeSpriteId={activeSprite.id}
              onSelectSprite={selectSprite}
              onAddSprite={addSprite}
              onDeleteSprite={deleteSprite}
              onUpdateSprite={updateActiveSprite}
            />

            <CodeBuddyPanel
              project={currentProject}
              spriteId={activeSprite.id}
              selectedBlockType={selectedBlockType}
            />

            <section className="rounded-[8px] border border-slate-200 bg-white p-3">
              <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-600">Runtime logs</h2>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-[8px] bg-slate-950 p-3 font-mono text-xs text-emerald-200">
                {logs.length === 0 ? <p>No logs yet.</p> : logs.map((line) => <p key={line}>{line}</p>)}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
