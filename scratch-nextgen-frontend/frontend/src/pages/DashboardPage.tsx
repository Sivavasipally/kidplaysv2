import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Download,
  FilePlus2,
  FolderOpen,
  Import,
  Play,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState } from '../components/common/EmptyState';
import { useProjectStore } from '../store/projectStore';
import { downloadProjectJson, readProjectFile } from '../storage/importExport';
import { formatFriendlyDate } from '../utils/time';
import type { Project } from '../types/project';

export function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const {
    projects,
    hasHydrated,
    hydrateProjects,
    createProject,
    duplicateProject,
    deleteProject,
    renameProject,
    importProject,
  } = useProjectStore();

  useEffect(() => {
    if (!hasHydrated) {
      void hydrateProjects();
    }
  }, [hasHydrated, hydrateProjects]);

  const visibleProjects = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return projects.filter((project) => project.name.toLowerCase().includes(lower));
  }, [projects, query]);

  const createAndOpen = async (name?: string) => {
    const project = await createProject(name);
    navigate(`/editor/${project.id}`);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const project = await readProjectFile(file);
      await importProject(project);
      navigate(`/editor/${project.id}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not import this project.');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#E0F2FE_0,#F8FAFC_40%,#FCE7F3_100%)] px-3 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-sky-700 shadow-sm">
              <Sparkles size={17} />
              Local-first kid coding
            </div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl md:text-5xl">Scratch NextGen</h1>
            <p className="mt-2 max-w-2xl text-base font-medium text-slate-600">
              Create animations, games, and stories with colorful blocks. Everything saves in this browser.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:flex-wrap">
            <Button tone="success" icon={<FilePlus2 size={18} />} onClick={() => void createAndOpen()} className="w-full md:w-auto">
              New project
            </Button>
            <Button tone="secondary" icon={<Import size={18} />} onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto">
              Import JSON
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="sr-only" onChange={handleImport} />
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              className="h-12 w-full rounded-[8px] border border-white bg-white/90 pl-12 pr-4 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-sky-400"
            />
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <TemplateButton label="Dance party" onClick={() => void createAndOpen('Dance party')} />
            <TemplateButton label="Space chase" onClick={() => void createAndOpen('Space chase')} />
            <TemplateButton label="Tiny story" onClick={() => void createAndOpen('Tiny story')} />
          </div>
        </section>

        <section className="mt-6">
          {visibleProjects.length === 0 ? (
            <EmptyState
              icon={<FolderOpen size={30} />}
              title={hasHydrated ? 'No projects yet' : 'Loading projects'}
              body="Start a new project or import a JSON project file from this computer."
              action={
                <Button tone="success" icon={<FilePlus2 size={18} />} onClick={() => void createAndOpen()}>
                  Create first project
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpen={() => navigate(`/editor/${project.id}`)}
                  onDuplicate={async () => {
                    const copy = await duplicateProject(project.id);
                    if (copy) {
                      navigate(`/editor/${copy.id}`);
                    }
                  }}
                  onDelete={() => {
                    if (window.confirm(`Delete "${project.name}"?`)) {
                      void deleteProject(project.id);
                    }
                  }}
                  onRename={() => {
                    const name = window.prompt('Project name', project.name);
                    if (name) {
                      void renameProject(project.id, name);
                    }
                  }}
                  onExport={() => downloadProjectJson(project)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type ProjectCardProps = {
  project: Project;
  index: number;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onExport: () => void;
};

function ProjectCard({
  project,
  index,
  onOpen,
  onDuplicate,
  onDelete,
  onRename,
  onExport,
}: ProjectCardProps) {
  const sprite = project.sprites[0];
  const costume = sprite?.costumes.find((item) => item.id === sprite.currentCostumeId) ?? sprite?.costumes[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-[8px] border border-white/80 bg-white shadow-soft"
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-sky-200 via-white to-pink-100 sm:h-44">
          {costume ? <img src={costume.dataUrl} alt="" className="h-28 w-28 object-contain drop-shadow-lg" /> : null}
        </div>
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onRename} className="min-w-0 text-left">
            <h2 className="truncate text-xl font-black text-slate-900">{project.name}</h2>
            <p className="text-sm font-semibold text-slate-500">{formatFriendlyDate(project.updatedAt)}</p>
          </button>
          <Button tone="success" icon={<Play size={16} />} onClick={onOpen} className="px-3">
            Open
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-slate-600">
          <div className="rounded-[8px] bg-slate-100 px-3 py-2">{project.sprites.length} sprites</div>
          <div className="rounded-[8px] bg-slate-100 px-3 py-2">v{project.version}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <IconButton label="Duplicate" icon={<Copy size={17} />} onClick={onDuplicate} />
          <IconButton label="Export JSON" icon={<Download size={17} />} onClick={onExport} />
          <IconButton label="Delete" icon={<Trash2 size={17} />} onClick={onDelete} className="text-rose-600" />
        </div>
      </div>
    </motion.article>
  );
}

type TemplateButtonProps = {
  label: string;
  onClick: () => void;
};

function TemplateButton({ label, onClick }: TemplateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-sky-50"
    >
      {label}
    </button>
  );
}
