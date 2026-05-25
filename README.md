# OpenTL — Tierlist Maker (Electron)

This is a minimal Tierlist Maker desktop app (OpenTL) inspired by tierlistmaker.com. It is built with Electron and a small UI for creating custom rows, colors, adding image or text cards, drag-and-drop, and exporting as PNG or JSON.

Getting started

1. Install Node.js (16+ recommended) on Windows.
2. In the project folder, install dependencies:

```bash
npm install
```

Run in development:

```bash
npm start
```

Build an installer (.exe) on Windows

```bash
npm run dist
```

Notes
- The build step uses `electron-builder` to produce a Windows installer (NSIS). You can customize `package.json` `build` settings (icon, appId, targets).
- Export uses `html2canvas` for PNG capture.
