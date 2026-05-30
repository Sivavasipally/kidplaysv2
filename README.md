# Scratch NextGen Frontend

Scratch NextGen is a frontend-only Scratch-inspired visual programming playground for kids. It runs locally in the browser with React, TypeScript, Vite, Tailwind CSS, Zustand, Blockly, IndexedDB, the File API, Canvas, and Web Audio.

There is no backend, cloud storage, server-side database, remote authentication, Python API, Flask, FastAPI, or generated JavaScript execution.

## What Is Included

- Kid-friendly project dashboard
- Create, open, rename, duplicate, delete, import, and export projects
- IndexedDB local project storage through Dexie
- Scratch-style three-panel editor
- Blockly workspace with custom event, motion, looks, sound, and control blocks
- Safe TypeScript interpreter that reads Blockly XML and maps blocks to controlled runtime actions
- Canvas stage with a 480x360 Scratch-like coordinate system
- Default sprite, movement, speech bubbles, waits, repeats, sprite clicks, and keyboard event starts
- Sprite details, local image costumes, and local sound uploads
- Runtime logs
- Rule-based frontend-only Code Buddy helper

## Requirements

- Windows 10 or newer
- Node.js 18 or newer
- npm

## Run Locally

```bash
cd scratch-nextgen-frontend/frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

On Windows, you can also run:

```bat
start-all.bat
```

or:

```bat
cd frontend
start-frontend.bat
```

## Build

```bash
cd scratch-nextgen-frontend/frontend
npm run build
```

## GitHub Pages Hosting

The app uses `HashRouter` and Vite relative asset paths, so it can be hosted from a GitHub Pages project URL such as:

```text
https://your-user.github.io/your-repo/
```

To deploy with GitHub Actions:

1. Push this repository to GitHub.
2. In GitHub, open Settings > Pages.
3. Set Source to GitHub Actions.
4. Push to the `main` branch, or run the `Deploy Scratch NextGen to GitHub Pages` workflow manually.

The workflow builds `scratch-nextgen-frontend/frontend` and publishes `scratch-nextgen-frontend/frontend/dist`.

You can also build the Pages-ready static files locally:

```bash
cd scratch-nextgen-frontend/frontend
npm run build:github
```

## Test Steps

1. Open the dashboard.
2. Create a new project.
3. Click Run. The default sprite should move and say hello.
4. Drag a Repeat block around Move, change the numbers, and click Run again.
5. Add a costume image from your computer and confirm it appears on the stage.
6. Save the project, return to the dashboard, and reopen it.
7. Export the project JSON, then import it again from the dashboard.
8. Try clicking the sprite on the stage after adding a "when this sprite clicked" event stack.

## Local Data

Projects are stored in the browser's IndexedDB database named `ScratchNextGenDatabase`. Uploaded images and sounds are stored inside project JSON as data URLs, so exported files remain portable.

## Folder Structure

```text
scratch-nextgen-frontend/
  frontend/
    public/
      assets/
      templates/
    src/
      app/
      components/
      pages/
      editor/
      store/
      storage/
      templates/
      types/
      utils/
    package.json
    vite.config.ts
    tsconfig.json
    tailwind.config.js
    postcss.config.js
    .env.example
    start-frontend.bat
  README.md
  start-all.bat
```
