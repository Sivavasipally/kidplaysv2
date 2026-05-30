# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Scratch NextGen is a **frontend-only**, Scratch-inspired visual programming playground for kids. There is no backend, server, database, auth, or remote API of any kind — everything runs in the browser. Treat any suggestion to add a server, cloud storage, or `eval`-style code execution as out of scope.

All code lives in `scratch-nextgen-frontend/frontend/`. The repo root only holds `.github/` (Pages deploy workflow), `start-all.bat`, and the project README.

## Commands

Run everything from `scratch-nextgen-frontend/frontend/`:

```bash
npm install        # first-time setup
npm run dev        # Vite dev server on http://localhost:5173 (binds 0.0.0.0)
npm run build      # tsc -b type-check, then vite build
npm run build:github  # same, with --base ./ for GitHub Pages
npm run preview    # serve the production build
```

There is **no test runner, linter, or formatter configured**. The only verification gate is `npm run build` (the `tsc -b` step type-checks the whole `src` tree under `strict` mode). Run it before considering a change complete.

## Architecture

Stack: React 18 + TypeScript + Vite, Tailwind CSS, Zustand (state), Dexie/IndexedDB (persistence), Blockly (block editor), Canvas (stage), Web Audio/`<audio>` (sound). Routing is `HashRouter` (required for GitHub Pages); routes are in `src/app/routes.tsx` — `/` dashboard and `/editor/:projectId`.

The system has three conceptual layers that are worth understanding together:

### 1. Data + persistence
- `src/types/` defines the domain: `Project` holds `sprites[]`, `backdrops[]`, `stageState` (480×360 coordinate space), and `globalVariables`. A `Sprite` carries its Blockly program as a raw XML string in `blocksXml`, plus costumes/sounds stored inline as data URLs (so exported JSON is fully self-contained and portable).
- `src/storage/indexedDb.ts` is the Dexie DB (`ScratchNextGenDatabase`, table `projects` keyed by `id`). `projectRepository.ts` wraps CRUD; `importExport.ts` handles JSON download/upload and normalizes/migrates imported files.
- `src/store/projectStore.ts` (Zustand) is the single source of truth for the loaded project. **All mutations go through `mutateCurrentProject(mutator, options)`**, which `structuredClone`s the project, applies the mutator, updates `updatedAt`, and persists to IndexedDB unless `{ persist: false }` / `{ touch: false }` is passed. Runtime/transient changes (sprite position during a run, speech bubbles) pass `persist: false, touch: false` so they don't hit the DB.

### 2. Block compilation (Blockly XML → instructions)
The runtime does **not** execute Blockly or generated JavaScript. Instead:
- `src/editor/blocks/` defines custom blocks (`blockDefinitions.ts`), the toolbox (`toolbox.ts`), and the Blockly workspace component (`BlocklyWorkspace.tsx`). Block type strings like `motion_move_steps`, `looks_say_seconds`, `control_repeat`, `event_when_green_flag` are the contract.
- `src/editor/runtime/instructionBuilder.ts` parses a sprite's `blocksXml` with `DOMParser` and walks the block tree, mapping each block type to a typed `Instruction` (see the discriminated union in `src/types/blocks.ts`). Top-level event blocks become `ExecutableScript`s tagged with a `ScriptTrigger` (greenFlag / spriteClick / keyPressed). Unknown blocks become `{ type: 'noop' }`.

**When adding a new block, you must touch all three places:** define it (`blockDefinitions.ts` + `toolbox.ts`), add a parse case (`instructionBuilder.ts`), add the `Instruction` variant (`types/blocks.ts`), and add an execution case (`interpreter.ts`).

### 3. Runtime interpreter
- `src/editor/runtime/interpreter.ts` is a controlled, async interpreter — the safety boundary of the app. It never evaluates user strings as code; it only `switch`es over the known `Instruction` union and applies bounded effects to sprite state. `startGreenFlagRun` / `startSpriteClickRun` / `startKeyRun` collect matching scripts and run them concurrently (`Promise.all`).
- Cooperative cancellation uses a **run token**: `runtimeStore` increments `runToken` on every start/stop. Long operations (`scheduler.ts` `waitFor`/`yieldFrame`, loop bodies) re-check `useRuntimeStore.getState().runToken === runToken` and bail the moment it changes, so "Stop" halts everything cleanly. Any new long-running or awaiting instruction must honor this token check.
- Stage math is centralized: `stage/stageMath.ts` (`clampToStage`) and `stage/collision.ts` (edge bounce, direction normalization). Positions use a Scratch-style centered coordinate system, not raw canvas pixels.
- `src/store/runtimeStore.ts` holds run status and a capped log buffer (last 60 lines).

### Supporting pieces
- `src/editor/sprites/`, `src/editor/stage/StageCanvas.tsx`, `src/editor/assets/` (image/sound upload + validation) are the editor UI panels.
- `src/editor/codeBuddy/` is a **rule-based** (not AI) helper: `rules.ts`/`suggestions.ts` pattern-match the project and emit kid-friendly tips.
- `src/templates/` seeds blank projects and starter sprites.

## Conventions
- Keep the app frontend-only and offline-capable; persistence is IndexedDB + portable JSON export.
- Asset uploads are stored as data URLs inside the project, not as file references.
- Vite `base` is `./` (relative paths) so the build works from any GitHub Pages subpath.
- Pushing to `main` triggers `.github/workflows` to build `frontend` and deploy `frontend/dist` to GitHub Pages.
