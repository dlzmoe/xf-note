# xf-note

![Application Screenshot](https://github.com/user-attachments/assets/4f2d8303-2f75-4973-876d-3d8c473f2504)

Cross-platform Markdown note-taking application based on Electron, featuring integrated directory tree navigation and real-time preview.

## Features

✅ Multi-document Markdown editing  
❌ Real-time directory tree generation  
✅ Automatic filename update  
✅ Responsive sidebar navigation  
✅ Chinese-friendly font support

## Technology Stack

- 🚀 Electron 20+ (Cross-platform desktop)
- ⚡ Vue3 + Vite (Frontend framework)
- 📦 File System Access API (Local file operations)
- 🎨 Element Plus (UI Component Library)

## Installation & Usage

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build installer
npm run make
```

## Project Structure

```
xf-note/
├── src/
│   ├── components/    # Vue components
│   │   ├── FileEditor.vue  # Core editor
│   │   ├── FolderList.vue  # Directory tree
│   │   └── TocSidebar.vue  # Outline navigation
│   ├── preload.js     # Electron IPC
│   └── renderer.js    # Renderer entry
├── package.json       # Project config
└── vite.config.mjs    # Vite config
```

## Development Guidelines

1. Use Composition API for Vue components
2. Electron main process code in /src/main
3. File operations through preload.js APIs
4. CSS preprocessing with PostCSS
5. Keep Markdown parser/renderer versions synchronized

## Shortcuts

Not available.

## Contribution Guide

PRs are welcome. Please follow this process:
1. Fork the repository
2. Create feature branch (feature/xxx)
3. Run npm run lint before committing
4. Update relevant unit tests
5. Submit PR with detailed description
